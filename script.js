
// Scroll button 

// Scroll button 
// document.addEventListener('DOMContentLoaded', function() {
//     const scrollToTopBtn = document.getElementById('scrollToTopBtn');
//     const scrollToBottomBtn = document.getElementById('scrollToBottomBtn');

//     scrollToTopBtn.addEventListener('click', function() {
//         window.scrollTo({
//             top: 0,
//             behavior: 'smooth'
//         });
//     });

//     scrollToBottomBtn.addEventListener('click', function() {
//         window.scrollTo({
//             top: document.body.scrollHeight,
//             behavior: 'smooth'
//         });
//     });
// });







async function fetchSolvedProblems() {
    const handle = document.getElementById('codeforcesID').value.trim();
    if (!handle) {
        alert('Please enter a Codeforces handle');
        return;
    }

    try {
        // Fetch user info to get the profile picture and contest rating
        const userInfoResponse = await fetch(`https://codeforces.com/api/user.info?handles=${handle}`);
        const userInfoData = await userInfoResponse.json();

        if (userInfoData.status === 'OK') {
            const user = userInfoData.result[0];
            const profilePicture = user.titlePhoto || 'https://codeforces.com/static/images/user/default.png';
            const contestRating = user.rating || 'Not rated'; // Assuming user.rating gives the contest rating

            // Fetch submissions to get solved problems
            const response = await fetch(`https://codeforces.com/api/user.status?handle=${handle}&from=1`);
            const data = await response.json();

            if (data.status === 'OK') {
                const submissions = data.result;
                let solvedProblems = [];
                let uniqueProblemSet = new Set(); // Set to track unique solved problems
                let attemptsMap = new Map(); // Map to track number of attempts for each problem

                submissions.forEach(submission => {
                    if (submission.verdict === 'OK') {
                        const problem = submission.problem;
                        const problemId = `${problem.contestId}${problem.index}`;
                        const problemLink = `https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`;
                        const problemName = problem.name;
                        const problemRating = problem.rating;
                        const submissionTime = new Date(submission.creationTimeSeconds * 1000).toLocaleString();
                        const tags = problem.tags || [];

                        let isDP = false;
                        tags.forEach(tag => {
                            if (tag.toLowerCase() === 'dp') {
                                isDP = true;
                            }
                        });

                        if (!uniqueProblemSet.has(problemId)) {
                            uniqueProblemSet.add(problemId);
                            attemptsMap.set(problemLink, 1); // First attempt

                            solvedProblems.push({
                                name: problemName,
                                rating: problemRating,
                                link: problemLink,
                                time: submissionTime,
                                attempts: 1, // First attempt
                                isDP: isDP
                            });
                        } else {
                            // Increment attempts count for existing problem
                            const attempts = attemptsMap.get(problemLink);
                            attemptsMap.set(problemLink, attempts + 1);
                            // Find and update attempts count in solvedProblems array
                            const existingProblem = solvedProblems.find(p => p.link === problemLink);
                            if (existingProblem) {
                                existingProblem.attempts = attempts + 1;
                            }
                        }
                    }
                });

                // Sort solved problems by rating (ascending)
                solvedProblems.sort((a, b) => a.rating - b.rating);

                // Detect cheating
                const solvedContests = submissions.reduce((acc, submission) => {
                    if (submission.author.participantType === 'CONTESTANT' || submission.author.participantType === 'OUT_OF_COMPETITION') {
                        if (!acc[submission.contestId]) {
                            acc[submission.contestId] = {
                                contestId: submission.contestId,
                                Problems: 0,
                                skippedProblems: 0,
                            };
                        }
                        acc[submission.contestId].Problems++;
                        if (submission.verdict === 'SKIPPED') {
                            acc[submission.contestId].skippedProblems++;
                        }
                    }
                    return acc;
                }, {});

                const cheatedContests = Object.values(solvedContests).filter(contest => contest.Problems > 1 && contest.skippedProblems === contest.Problems);

                const solvedProblemsList = document.getElementById('solvedProblems');
                const totalSolved = solvedProblems.length;
                const uniqueSolved = uniqueProblemSet.size;

                let cheatingInfo = '';
                if (cheatedContests.length === 0) {
                    cheatingInfo = `<p class="cheating-message">${handle} never cheated in any contest!</p>`;
                } else {
                    cheatingInfo = `<p class="cheating-message">${handle} cheated in ${cheatedContests.length} contest(s)!</p>`;

                    cheatingInfo += `<table>
                        <thead>
                            <tr>
                                <th>Contest ID</th>
                                <th>Contest Name</th>
                            </tr>
                        </thead>
                        <tbody>`;
                    const contestDataResponse = await fetch('https://codeforces.com/api/contest.list');
                    const contestData = await contestDataResponse.json();
                    const contests = contestData.result;
                    cheatedContests.forEach(contest => {
                        const contestName = contests.find(c => c.id === contest.contestId).name;
                        cheatingInfo += `<tr>
                            <td><a href="https://codeforces.com/contest/${contest.contestId}" target="_blank">${contest.contestId}</a></td>
                            <td><a href="https://codeforces.com/contest/${contest.contestId}" target="_blank">${contestName}</a></td>
                        </tr>`;
                    });
                    cheatingInfo += `</tbody></table>`;
                }

                solvedProblemsList.innerHTML = `
                    <img src="${profilePicture}" alt="${handle}'s Profile Picture">
                    <h2>${handle}</h2>
                    <h3>Contest Rating: ${contestRating}</h3>
                    <h3>Total Solved Problems: ${totalSolved}</h3>
                    <!--<h3>Unique Problems Solved: ${uniqueSolved}</h3>-->
                    ${cheatingInfo}
                    <h3 class="cheating-message">Solved Problems</h3> <!-- Subheading added here -->
                    <ul>
                        ${solvedProblems.map(problem => `
                            <li class="rating-${problem.rating}">
                                <a href="${problem.link}" target="_blank">${problem.name}</a>
                                <span>Rating: ${problem.rating}</span>
                                <span>Solved on: ${problem.time}</span>
                                <!-- ${problem.isDP ? '<span>DP Problem</span>' : ''}--->
                            </li>
                        `).join('')}
                    </ul>`;
            } else {
                alert(`Error: ${data.comment}`);
            }
        } else {
            
            alert(`Error: ${userInfoData.comment}`);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        alert('An error occurred while fetching data. Please try again later.');
    }
}



// footer

$(document).ready(function () {
    let year = document.querySelector('#year');
    year.innerText = new Date().getFullYear();
});


// scroll button 

