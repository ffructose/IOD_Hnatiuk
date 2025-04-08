export function computeMatrixRanks(data, userIds, allowedSongIds) {
    // 1. Зібрати всі унікальні song_id
    const allSongIdsSet = new Set();
    userIds.forEach(userId => {
      data[userId].forEach(songId => {
        if (allowedSongIds.includes(Number(songId))) {
          allSongIdsSet.add(Number(songId));
        }
      });
    });
  
    const allSongIds = Array.from(allSongIdsSet).sort((a, b) => a - b);
  
    // 2. Створити matrixRanks: [ [rank1, rank2, ...], ... ]
    const matrixRanks = allSongIds.map(songId => {
      return userIds.map(userId => {
        const ranking = data[userId];
        const index = ranking.indexOf(songId);
        return index === -1 ? 0 : index + 1;
      });
    });
  
    return { matrixRanks, allSongIds };
  }
  