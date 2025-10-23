const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bio, profile } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an expert resume writer. Create a professional, ATS-friendly resume based on the user's bio and profile information. Format the response as a JSON object with the following structure:
    {
      "fullName": "string",
      "location": "string",
      "contact": {
        "email": "string",
        "phone": "string",
        "linkedin": "string"
      },
      "summary": "string (3-4 sentences)",
      "skills": ["skill1", "skill2", ...],
      "experience": [
        {
          "title": "string",
          "company": "string",
          "period": "string",
          "description": ["bullet point 1", "bullet point 2", ...]
        }
      ],
      "education": [
        {
          "degree": "string",
          "institution": "string",
          "year": "string"
        }
      ],
      "certifications": ["cert1", "cert2", ...],
      "projects": [
        {
          "name": "string",
          "description": "string",
          "technologies": ["tech1", "tech2"]
        }
      ]
    }

    Make the resume professional, concise, and impactful. Extract relevant information from the bio and enhance it with industry best practices.`;

    const userPrompt = `Profile Information:
    - Name: ${profile.full_name || 'Not provided'}
    - Desired Role: ${profile.desired_role || 'Not provided'}
    - Career Motivation: ${profile.career_motivation || 'Not provided'}

    Professional Bio:
    ${bio}

    Please create a comprehensive resume based on this information.`;

    console.log('Calling Lovable AI for resume generation...');

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
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    console.log('AI response received, parsing resume...');

    // Extract JSON from the response (it might be wrapped in markdown code blocks)
    let resumeData;
    try {
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      resumeData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.log('Raw content:', content);
      throw new Error('Failed to parse resume data from AI response');
    }

    return new Response(
      JSON.stringify({ resume: resumeData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-resume function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred generating the resume';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
