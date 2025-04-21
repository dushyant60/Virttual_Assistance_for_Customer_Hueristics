import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Tooltip, makeStyles } from '@material-ui/core';
import { motion, AnimatePresence } from 'framer-motion';

const useStyles = makeStyles((theme) => ({
  wordCloudContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
    background: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  word: {
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'all 0.3s ease',
    fontFamily: '"Inter", sans-serif',
    '&:hover': {
      filter: 'brightness(0.9)',
    },
  },
}));

const getRandomPosition = (containerWidth, containerHeight, wordWidth, wordHeight) => {
  const x = Math.random() * (containerWidth - wordWidth);
  const y = Math.random() * (containerHeight - wordHeight);
  return { x, y };
};

const getColor = (value) => {
  const colors = [
    '#2196F3', // Blue
    '#1976D2', // Darker Blue
    '#64B5F6', // Lighter Blue
    '#0D47A1', // Very Dark Blue
    '#42A5F5', // Medium Blue
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

const WordCloud = ({ text }) => {
  const classes = useStyles();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hoveredWord, setHoveredWord] = useState(null);
  const containerRef = React.useRef(null);

  const stopWords = [
    'a', 'an', 'the', 'and', 'in', 'on', 'at', 'to', 'for', 'with', 'as',
    'of', 'by', 'from', 'is', 'it', 'this', 'that', 'which', 'he', 'she',
    'what', 'have', 'does', 'did', 'they', 'were', 'be', 'these', 'where', 'we', 'will'
  ];

  const words = useMemo(() => {
    if (!text) return [];
    
    const wordCounts = text.toLowerCase()
      .split(/\s+/)
      .filter(word => !stopWords.includes(word))
      .reduce((acc, word) => {
        acc[word] = (acc[word] || 0) + 1;
        return acc;
      }, {});

    return Object.entries(wordCounts)
      .map(([text, count]) => ({
        text,
        value: count,
        size: Math.max(16, Math.min(48, count * 8)), // Font size between 16 and 48
        color: getColor(count),
        position: { x: 0, y: 0 },
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 50); // Limit to top 50 words
  }, [text]);

  useEffect(() => {
    if (containerRef.current) {
      const updateDimensions = () => {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      };

      updateDimensions();
      window.addEventListener('resize', updateDimensions);
      return () => window.removeEventListener('resize', updateDimensions);
    }
  }, []);

  useEffect(() => {
    if (dimensions.width && dimensions.height) {
      words.forEach(word => {
        word.position = getRandomPosition(
          dimensions.width,
          dimensions.height,
          word.size * word.text.length * 0.6,
          word.size
        );
      });
    }
  }, [dimensions, words]);

  return (
    <Box
      ref={containerRef}
      className={classes.wordCloudContainer}
      style={{ minHeight: '300px' }}
    >
      <AnimatePresence>
        {words.map((word, index) => (
          <Tooltip
            key={word.text}
            title={`Frequency: ${word.value}`}
            placement="top"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                x: word.position.x,
                y: word.position.y,
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ 
                duration: 0.5,
                delay: index * 0.02,
                type: 'spring',
                stiffness: 100
              }}
              style={{
                position: 'absolute',
                fontSize: `${word.size}px`,
                color: word.color,
                fontWeight: word.value > 2 ? 600 : 400,
              }}
              className={classes.word}
              onMouseEnter={() => setHoveredWord(word)}
              onMouseLeave={() => setHoveredWord(null)}
              whileHover={{ scale: 1.1 }}
            >
              {word.text}
            </motion.div>
          </Tooltip>
        ))}
      </AnimatePresence>
    </Box>
  );
};

export default WordCloud;