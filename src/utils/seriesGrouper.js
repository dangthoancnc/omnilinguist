// src/utils/seriesGrouper.js
// Utility module to detect, parse, group, and sort multi-part reading stories into Series collections.

/**
 * Parses raw title into Main Japanese title and Vietnamese subtitle.
 */
export const parseStoryTitle = (rawTitle) => {
  if (!rawTitle) return { main: '', sub: '' };
  const match = rawTitle.match(/^(.*?)\s*[\(（]([^()（）]+)[\)）]\s*$/);
  if (match) {
    return { main: match[1].trim(), sub: match[2].trim() };
  }
  return { main: rawTitle.trim(), sub: '' };
};

/**
 * Extracts Series base title, episode/part number, and cleans metadata.
 */
export const extractSeriesInfo = (rawTitle) => {
  if (!rawTitle) {
    return {
      originalTitle: '',
      cleanTitle: '',
      seriesTitle: '',
      partNumber: 1,
      hasPartIndicator: false,
      parsed: { main: '', sub: '' }
    };
  }

  // Remove leading emojis or decorative icons like 📖, 📚, 🎨, ⭐, ✨ etc. (preserve Japanese kana/kanji)
  const cleanTitle = rawTitle.replace(/^[\p{Extended_Pictographic}\u2600-\u27BF\u2B50\s]+/u, '').trim();

  // Match episode indicator: (Phần X), (Tập X), (Chapter X), (Part X), (Hồi X)
  const partMatch = cleanTitle.match(/[\(（]\s*(?:Phần|Tập|Hồi|Chapter|Part)\s*(\d+)\s*[\)）]/i);
  const partNumber = partMatch ? parseInt(partMatch[1], 10) : 1;

  // Remove all part indicators to form the base series title
  const baseTitle = cleanTitle
    .replace(/[\(（]\s*(?:Phần|Tập|Hồi|Chapter|Part)\s*\d+\s*[\)）]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  const parsed = parseStoryTitle(baseTitle);

  return {
    originalTitle: rawTitle,
    cleanTitle,
    seriesTitle: baseTitle,
    partNumber,
    hasPartIndicator: !!partMatch,
    parsed
  };
};

/**
 * Groups an array of stories into structured Series collections.
 * Automatically sorts parts in natural ascending order (1, 2, 3, ...).
 */
export const groupStoriesIntoSeries = (stories = []) => {
  if (!Array.isArray(stories) || stories.length === 0) return [];

  const seriesMap = new Map();

  stories.forEach(story => {
    if (!story) return;

    // Multi-chapter books already have chapters embedded
    if (story.isMultiChapter && Array.isArray(story.chapters) && story.chapters.length > 0) {
      const parsed = parseStoryTitle(story.title);
      const sKey = `book_${story.id}`;
      seriesMap.set(sKey, {
        id: story.id,
        seriesKey: sKey,
        isMultiChapterBook: true,
        isSeries: true,
        title: story.title,
        parsedTitle: parsed,
        level: story.level || 'N5',
        genre: story.genre || 'literature',
        genreLabel: story.genreLabel || (story.genre === 'ehon' ? '🎨 Sách Tranh Ehon' : '📚 Văn học & Cổ tích'),
        author: story.author || 'OmniLinguist Literature Lab',
        readingTime: story.readingTime || `${story.chapters.length * 3} phút`,
        summary: story.summary || '',
        totalParts: story.chapters.length,
        coverArtwork: story.coverArtwork || story.imageUrl || story.chapters[0]?.imageUrl || null,
        parts: story.chapters.map((ch, idx) => ({
          id: `${story.id}_ch${ch.chapterNumber || idx + 1}`,
          bookId: story.id,
          chapterIndex: idx,
          partNumber: ch.chapterNumber || idx + 1,
          title: ch.chapterTitle || `Chương ${idx + 1}`,
          readingTime: ch.readingTime || '3 phút',
          summary: ch.summary || '',
          content: ch.content || '',
          level: story.level || 'N5',
          genre: story.genre || 'literature',
          genreLabel: story.genreLabel || (story.genre === 'ehon' ? '🎨 Sách Tranh Ehon' : '📚 Văn học & Cổ tích'),
          author: story.author || '',
          imageUrl: ch.imageUrl || story.coverArtwork || story.imageUrl || null,
          isChapterOfBook: true
        }))
      });
      return;
    }

    const info = extractSeriesInfo(story.title);
    // Key by level + normalized base title
    const normTitle = info.seriesTitle.replace(/[\s\(\)（）\-_]/g, '').toLowerCase();
    const key = `${(story.level || 'N5').slice(0, 2)}_${normTitle}`;

    if (!seriesMap.has(key)) {
      seriesMap.set(key, {
        id: `series_${key}`,
        seriesKey: key,
        isMultiChapterBook: false,
        title: info.seriesTitle,
        parsedTitle: info.parsed,
        level: story.level || 'N5',
        genre: story.genre || 'general',
        genreLabel: story.genreLabel || (story.genre === 'ehon' ? '🎨 Sách Tranh Ehon' : '📖 Bài đọc'),
        author: story.author || 'Tác giả Nhật Bản',
        summary: story.summary || '',
        coverArtwork: story.coverArtwork || story.imageUrl || null,
        parts: []
      });
    }

    const currentSeries = seriesMap.get(key);

    // If this part has an artwork and the series doesn't yet, preserve it
    const partArtwork = story.coverArtwork || story.imageUrl;
    if (!currentSeries.coverArtwork && partArtwork) {
      currentSeries.coverArtwork = partArtwork;
    }
    if (!currentSeries.summary && story.summary) {
      currentSeries.summary = story.summary;
    }

    // Add this episode/part (avoid duplicate ids)
    if (!currentSeries.parts.some(p => p.id === story.id)) {
      currentSeries.parts.push({
        ...story,
        partNumber: info.partNumber,
        cleanPartTitle: story.title
      });
    }
  });

  // Finalize and sort each series' parts
  const result = [];
  for (const series of seriesMap.values()) {
    // Sort parts in ascending natural order
    series.parts.sort((a, b) => a.partNumber - b.partNumber);

    series.totalParts = series.parts.length;
    series.isSeries = series.totalParts > 1;

    // If first part has artwork, use it as series cover
    if (!series.coverArtwork) {
      series.coverArtwork = series.parts[0]?.coverArtwork || series.parts[0]?.imageUrl || null;
    }

    // Calculate total reading time or aggregate
    if (!series.readingTime) {
      if (series.totalParts > 1) {
        series.readingTime = `~${series.totalParts * 2} phút (${series.totalParts} tập)`;
      } else if (series.parts[0]?.readingTime) {
        series.readingTime = series.parts[0].readingTime;
      } else {
        series.readingTime = '2 phút';
      }
    }

    result.push(series);
  }

  return result;
};

/**
 * Finds which series a given story ID belongs to, and calculates
 * the current episode position, previous episode, and next episode.
 */
export const findSeriesForStory = (storyId, groupedSeries = []) => {
  if (!storyId || !Array.isArray(groupedSeries)) return null;

  for (const series of groupedSeries) {
    const partIdx = series.parts.findIndex(p => p.id === storyId);
    if (partIdx !== -1) {
      const currentPart = series.parts[partIdx];
      const prevPart = partIdx > 0 ? series.parts[partIdx - 1] : null;
      const nextPart = partIdx < series.parts.length - 1 ? series.parts[partIdx + 1] : null;

      return {
        series,
        currentPart,
        partIndex: partIdx,
        partNumber: currentPart.partNumber || partIdx + 1,
        totalParts: series.totalParts,
        prevPart,
        nextPart,
        isSeries: series.totalParts > 1
      };
    }
  }

  return null;
};
