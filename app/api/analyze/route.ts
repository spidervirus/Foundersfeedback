import { NextRequest, NextResponse } from 'next/server';
import { scrapePage, generateFounderReport } from '@/lib/ai/advisor';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      building,
      whoIsFor,
      painPoint,
      stage,
      landingPageUrl,
      parentId,
    } = body;

    // Validate required fields
    if (!building || !whoIsFor || !painPoint || !stage) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Scrape landing page if URL provided
    let urlContent = null;
    if (landingPageUrl) {
      try {
        urlContent = await scrapePage(landingPageUrl);
      } catch (error) {
        console.error('Scraping error:', error);
      }
    }

    // Generate Founder Clarity Report
    const report = await generateFounderReport({
      building,
      whoIsFor,
      painPoint,
      stage,
      urlContent
    });

    let analysisId = `analysis-${Date.now()}`;
    let savedToDb = false;

    if (user) {
      try {
        // 1. Create Submission
        const { data: submission, error: subError } = await supabase
          .from('submissions')
          .insert({
            user_id: user.id,
            parent_id: parentId || null,
            landing_page_url: landingPageUrl || '',
            target_customer: whoIsFor,
            value_prop: building,
            stage: stage,
            status: 'analyzed',
            input_data: {
              building,
              whoIsFor,
              painPoint,
              stage
            }
          })
          .select()
          .single();

        if (subError) throw subError;

        // 2. Create Founder Report
        const { data: founderReport, error: reportError } = await supabase
          .from('founder_reports')
          .insert({
            submission_id: submission.id,
            user_id: user.id,
            positioning_verdict: report.positioningVerdict,
            brutal_truth: report.brutalTruth,
            focus_areas: report.focusAreas,
            ignore_areas: report.ignoreAreas
          })
          .select()
          .single();

        if (reportError) throw reportError;

        // 3. Create Execution Tasks
        const tasks = report.sevenDayPlan.map((item: any) => ({
          report_id: founderReport.id,
          day: item.day,
          description: item.task
        }));

        const { error: tasksError } = await supabase
          .from('execution_tasks')
          .insert(tasks);

        if (tasksError) throw tasksError;

        analysisId = submission.id;
        savedToDb = true;

      } catch (dbError) {
        console.error('Database save error:', dbError);
      }
    }

    return NextResponse.json({
      analysisId,
      savedToDb,
      report,
      success: true
    });

  } catch (error: any) {
    console.error('Analysis API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate clarity report' },
      { status: 500 }
    );
  }
}
