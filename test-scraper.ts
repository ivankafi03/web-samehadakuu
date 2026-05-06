import { getLatestAnime } from './lib/anime';

async function test() {
    console.log("Testing getLatestAnime...");
    try {
        const results = await getLatestAnime();
        console.log(`Total results: ${results.length}`);

        const withRatings = results.filter(r => r.rating && r.rating !== '0.0');
        const withoutRatings = results.filter(r => !r.rating || r.rating === '0.0');

        console.log(`Results with ratings: ${withRatings.length}`);
        console.log(`Results without ratings: ${withoutRatings.length}`);

        console.log("\nSample with ratings:");
        withRatings.slice(0, 5).forEach(r => console.log(`- ${r.title}: ${r.rating}`));

        if (withoutRatings.length > 0) {
            console.log("\nSample without ratings:");
            withoutRatings.slice(0, 5).forEach(r => console.log(`- ${r.title} (${r.link})`));
        }

    } catch (error) {
        console.error("Test failed:", error);
    }
}

test();
