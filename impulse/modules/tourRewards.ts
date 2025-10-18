export const handlers: Chat.Handlers = {
  async onTournamentEnd(tournament) {
    try {
      const rewardConfig = Config.tournamentRewards;
      if (rewardConfig?.eligibleRooms.includes(tournament.room.roomid)) {
        const playerCount = tournament.players.length;
        let multiplier = 1;
        if (playerCount > 4) {
          multiplier = 1 + ((playerCount - 4) * 0.2);
        }
        const baseRewards = rewardConfig.rewards.map(reward => Math.floor(reward * multiplier));
        const results = tournament.generator.getResults();

        const isSingleElimination = tournament.generator.name?.toLowerCase().includes('elimination') &&
          (tournament.generator.maxSubtrees === 1 || /single/i.test(tournament.generator.name));

        const rewardMessages: string[] = [];
        const places = ['winner', 'runner-up'];

        const maxPlace = isSingleElimination ? 1 : Math.min(baseRewards.length, results.length);

        for (let place = 0; place < maxPlace; place++) {
          for (const player of results[place]) {
            const userId = typeof player === 'string' ? toID(player) : player.id;
            const userName = typeof player === 'string' ? player : player.name;
            await Economy.updateBalance(userId, baseRewards[place]);
            await Economy.logTransaction({
              from: 'system',
              to: userId,
              amount: baseRewards[place],
              type: 'reward',
              reason: `Tournament ${places[place]}`,
              timestamp: new Date(),
            });
            rewardMessages.push(
              `<strong>${userName}</strong> (${places[place]}) has earned <span style="font-weight:bold;">${Economy.formatMoney(baseRewards[place])}</span> for their performance!`
            );
          }
        }
        if (rewardMessages.length) {
          tournament.room.add(
            `|html|<div class="broadcast-green"><b>Tournament Rewards:</b><br />${rewardMessages.join('<br />')}</div>`
          );
          tournament.room.update();
        }
      }
    } catch (err) {
      Monitor.error(`Failed to distribute tournament rewards: ${err}`);
    }
  }
};
