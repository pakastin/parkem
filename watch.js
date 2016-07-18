
var watch = require('@pakastin/watch');

watch('css/**/*.styl', 'npm run build-css', true);
watch('js/**/*.js', 'npm run build-js', true);
