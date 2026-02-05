import { NextRequest, NextResponse } from 'next/server';
import { scrapePage, analyzeProduct } from '@/lib/ai/analyzer';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      landingPageUrl,
      pricingPageUrl,
      targetCustomer,
      valueProp,
      stage,
      productType,
      parentId, // Added for version tracking
    } = body;

    // Validate required fields
    if (!landingPageUrl || !targetCustomer || !valueProp) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Initialize Supabase to check auth
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch previous analysis if parentId exists
    let previousScores;
    if (parentId) {
      const { data: prevAnalysis } = await supabase
        .from('analyses')
        .select('positioning_score, icp_score')
        .eq('submission_id', parentId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (prevAnalysis) {
        previousScores = {
          positioning: prevAnalysis.positioning_score,
          icp: prevAnalysis.icp_score
        };
      }
    }

    // Scrape landing page
    console.log('Scraping landing page:', landingPageUrl);
    const pageContent = await scrapePage(landingPageUrl);

    // Optionally scrape pricing page
    let pricingContent;
    if (pricingPageUrl) {
      try {
        console.log('Scraping pricing page:', pricingPageUrl);
        pricingContent = await scrapePage(pricingPageUrl);
      } catch (error) {
        console.error('Failed to scrape pricing page:', error);
        // Continue without pricing page
      }
    }

    // Analyze with AI
    console.log('Analyzing product iteration...');
    const analysis = await analyzeProduct(
      pageContent,
      targetCustomer,
      valueProp,
      pricingContent,
      previousScores
    );

    let analysisId = `analysis-${Date.now()}`;
    let savedToDb = false;

    // Save to Database if user is logged in
    if (user) {
      try {
        // 1. Create Submission (with parent_id)
        const { data: submission, error: subError } = await supabase
          .from('submissions')
          .insert({
            user_id: user.id,
            parent_id: parentId || null,
            landing_page_url: landingPageUrl,
            target_customer: targetCustomer,
            value_prop: valueProp,
            stage: stage,
            product_type: productType,
            status: 'analyzed'
          })
          .select()
          .single();

        if (subError) throw subError;

        // 2. Create Analysis
        const { data: savedAnalysis, error: analysisError } = await supabase
          .from('analyses')
          .insert({
            submission_id: submission.id,
            positioning_score: analysis.positioning.score,
            icp_score: analysis.icp.score,
            differentiation_score: analysis.differentiation.score,
            pricing_score: analysis.pricing.score,
            competitors: analysis.competitors,
            suggestions: analysis.headlineSuggestions,
            full_report: analysis
          })
          .select()
          .single();

        if (analysisError) throw analysisError;

        // Use the DB ID if saved successfully
        analysisId = savedAnalysis.id;
        savedToDb = true;

      } catch (dbError) {
        console.error('Database save error:', dbError);
        // Fallback to local storage flow if DB fails, but log it
      }
    }

    const result = {
      analysisId,
      savedToDb,
      submission: {
        landingPageUrl,
        targetCustomer,
        valueProp,
        stage,
        productType,
      },
      analysis,
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Analysis API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze product' },
      { status: 500 }
    );
  }
}
