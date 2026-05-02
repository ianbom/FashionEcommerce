const fs = require('fs');

const localImages = [
    '/img/abdul-raheem-kannath-aNWfK46QWto-unsplash.jpg',
    '/img/ainur-iman-qcNmigFPTQM-unsplash.jpg',
    '/img/atiyeh-fathi-CvdzGjVX9DA-unsplash.jpg',
    '/img/hasan-almasi-_X2UAmIcpko-unsplash.jpg',
    '/img/ike-ellyana-2F70bGqQVa4-unsplash.jpg',
    '/img/khaled-ghareeb-n84s3jgzhKk-unsplash.jpg',
    '/img/m-ghufanil-muta-ali-vAyDuvcjXcs-unsplash.jpg',
    '/img/mina-rad-2O2cXJemDmo-unsplash.jpg',
    '/img/monody-le-7YrRbgOPibw-unsplash.jpg',
    '/img/omar-elsharawy-gFHBofW3ncQ-unsplash.jpg',
    '/img/sajimon-sahadevan-AWC94dVpTPc-unsplash.jpg',
    '/img/sarah-khan-R7p66Oj8ZOQ-unsplash.jpg',
    '/img/shedrack-salami-DRjeesi2kFM-unsplash.jpg',
];

const files = [
    'resources/js/pages/home.tsx',
    'resources/js/pages/welcome.tsx',
    'resources/js/pages/detail.tsx'
];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let index = 0;
    
    // Regex matches https://loremflickr.com/... until it hits a quote or parenthesis
    content = content.replace(/https:\/\/loremflickr\.com\/[^'")]+\b/g, (match) => {
        const img = localImages[index % localImages.length];
        index++;

        return img;
    });
    
    fs.writeFileSync(file, content);
    console.log('Updated ' + file);
});
