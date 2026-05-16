import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import 'dotenv/config'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testUpload() {
  const fileBuffer = fs.readFileSync("./test.txt");

  const { data, error } = await supabase.storage
    .from("patterns")
    .upload("test/test.txt", fileBuffer, {
      contentType: "text/plain",
      upsert: true,
    });

  console.log("DATA:", data);
  console.log("ERROR:", error);
}

testUpload();