
export const splitBuffer = (buffer: Buffer, chunkSize: number) => {
    let chunks = [];
    for (let i = 0; i < buffer.length; i += chunkSize) {
      const chunk = buffer.subarray(i, i + chunkSize);
      chunks.push(chunk);
    }
    return chunks;
  };