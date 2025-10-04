import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an AI Research Assistant that creates professional, structured research reports.

For the given research context, generate a comprehensive synthesis that includes:

1. Executive Summary: 5-6 lines in plain English summarizing the key findings and their significance
2. Key Insights: 3-4 major insights, each with:
   - A clear title
   - 2-3 lines of content explaining the insight
   - A specific visualization suggestion (chart type and what it should show)
3. Ethical & Real-World Implications: A paragraph discussing potential risks, ethical considerations, and practical applications
4. Recommendations: 4-5 actionable recommendations for researchers, businesses, or policymakers

Return the response as a valid JSON object with this structure:
{
  "executiveSummary": "string",
  "keyInsights": [{"title": "string", "content": "string", "visual": "string"}],
  "implications": "string",
  "recommendations": ["string"]
}

Keep the output professional, export-ready, and focused on utility. No filler content.`;

    console.log('Calling Lovable AI for synthesis...');
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Synthesize this research: ${context}` }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      throw new Error(`AI request failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('AI Response:', content);
    
    // Parse the JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from AI');
    }
    
    const result = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in synthesize-research function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
