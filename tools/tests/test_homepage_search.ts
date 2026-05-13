import { searchJav } from "../../lib/jav";

async function test() {
    console.log("Testing search for 'Beautiful Breasts'...");
    const results = await searchJav("Beautiful Breasts", 1);
    console.log(`Found ${results.videos.length} videos.`);
    results.videos.slice(0, 3).forEach((v, i) => {
        console.log(`${i+1}. ${v.title} (${v.episode})`);
    });
}

test();
