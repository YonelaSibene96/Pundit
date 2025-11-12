import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileData, fileName } = await req.json();

    if (!fileData) {
      throw new Error("No file data provided");
    }

    // Basic text extraction - in a real app, you'd use a PDF parsing library
    // For now, we'll just decode base64 and try to extract text
    const base64Data = fileData.split(",")[1] || fileData;
    const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    
    let extractedText = "";
    
    // Simple text extraction for demonstration
    // For PDF/DOCX parsing, you'd typically use specialized libraries
    try {
      const decoder = new TextDecoder();
      extractedText = decoder.decode(binaryData);
      
      // Clean up the text - remove null bytes and control characters
      extractedText = extractedText
        .replace(/\0/g, '')
        .replace(/[\x00-\x1F\x7F-\x9F]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
        
    } catch (e) {
      console.error("Error decoding file:", e);
      extractedText = "Unable to extract text from file. Please try a different format or write your bio manually.";
    }

    return new Response(
      JSON.stringify({ text: extractedText }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error in parse-resume function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
