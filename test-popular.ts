import { getPopularAnime } from './lib/anime';

async function testPopular() {
    console.log("Testing getPopularAnime...");
    try {
        const results = await getPopularAnime();
        console.log(`Total results: ${results.length}`);
        results.slice(0, 5).forEach(r => console.log(`- ${r.title} (${r.link})`));
    } catch (error) {
        console.error("Test failed:", error);
    }
}

testPopular();
