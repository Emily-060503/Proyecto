try {
  console.log(require.resolve('ejs'));
} catch (err) {
  console.error('ERROR:', err && err.message);
  process.exit(1);
}
