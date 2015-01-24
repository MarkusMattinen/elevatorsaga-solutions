                if (!window.fails) {
                    window.fails = 0;
                }

                if (!window.wins) {
                    window.wins = 0;
                }

                if (challengeStatus) {
                    window.wins += 1;
                } else {
                    window.fails += 1;
                }

                console.log("Win rate " + window.wins / (window.wins + window.fails));

                if (window.wins + window.fails < 100) {
                    app.startChallenge(app.currentChallengeIndex, true);
                } else {
                    window.alert("Win rate " + window.wins / (window.wins + window.fails));
                }
