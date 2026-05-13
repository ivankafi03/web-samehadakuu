import { getLatestVideos, getJavDetail, getJavWatchData, searchJav } from '../../lib/jav';

async function test() {
    console.log("--- Testing getLatestVideos ---");
    const latestResult = await getLatestVideos();
    const latest = latestResult.videos;
    console.log(`Found ${latest.length} videos (Total: ${latestResult.total}, Pages: ${latestResult.totalPages})`);
    if (latest.length > 0) {
        console.log("Sample:", latest[0]);
        
        const firstId = latest[0].href.split('/').pop() || '';
        console.log(`\n--- Testing getJavDetail for ID: ${firstId} ---`);
        const detail = await getJavDetail(firstId);
        console.log("Detail Title:", detail?.title);
        console.log("Detail Code:", detail?.originalTitle);
        
        console.log(`\n--- Testing getJavWatchData for ID: ${firstId} ---`);
        const watch = await getJavWatchData(firstId);
        console.log("Watch Data Servers:", watch?.servers);
    }

    console.log("\n--- Testing searchJav for 'School' ---");
    const searchResults = await searchJav('School');
    console.log(`Found ${searchResults.videos.length} search results (Total: ${searchResults.total})`);
}

test().catch(console.error);
