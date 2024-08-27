import wavPlayer from 'node-wav-player';

wavPlayer.play({
  path: './src/test.wav'
}).then(() => {
  console.log('Playback finished');
}).catch((error) => {
  console.error('Error playing sound:', error);
});