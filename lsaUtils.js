// In lsaUtils.js

// Function to calculate the cosine similarity between two arrays of numbers
function calculateCosineSimilarity(arr1, arr2) {
    if (arr1.length !== arr2.length) {
      throw new Error('Arrays must have the same length to calculate cosine similarity');
    }
  
    const dotProduct = arr1.reduce((acc, val, i) => acc + val * arr2[i], 0);
    const magnitude1 = Math.sqrt(arr1.reduce((acc, val) => acc + val ** 2, 0));
    const magnitude2 = Math.sqrt(arr2.reduce((acc, val) => acc + val ** 2, 0));
  
    if (magnitude1 === 0 || magnitude2 === 0) {
      throw new Error('Magnitude of one of the arrays is zero, cannot calculate cosine similarity');
    }
  
    return dotProduct / (magnitude1 * magnitude2);
  }
  
  module.exports = {
    calculateCosineSimilarity
  };
  