const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  
  console.log('Loading page...');
  await page.goto('https://share-shelf-ashen.vercel.app/my');
  await page.waitForTimeout(5000);

  // 1. Hero
  console.log('Taking screenshot 1 (Hero)...');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '../screenshots/01.png' });

  // 2. How it works
  console.log('Taking screenshot 2 (How it works)...');
  await page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll('h2, h3'));
    // Find the heading that contains the text
    const target = headings.find(h => h.innerText.includes('ဘယ်လို အလုပ်လုပ်လဲ') || h.innerText.includes('အလုပ်လုပ်'));
    if (target) {
      // scroll so the heading is near the top of the viewport
      const y = target.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo(0, y);
    } else {
      window.scrollTo(0, 950);
    }
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '../screenshots/02.png' });

  // 3. Testimonial and CTA
  console.log('Taking screenshot 3 (Testimonial)...');
  await page.evaluate(() => {
    const pTags = Array.from(document.querySelectorAll('p'));
    const target = pTags.find(p => p.innerText.includes('အတူတူ') || p.innerText.includes('မျှဝေကြပါစို့'));
    if (target) {
      // Center the testimonial roughly
      const y = target.getBoundingClientRect().top + window.scrollY - 300;
      window.scrollTo(0, y);
    } else {
      // Find the last CTA section
      const sections = document.querySelectorAll('section');
      if (sections.length > 0) {
          const lastSection = sections[sections.length - 1];
          const y = lastSection.getBoundingClientRect().top + window.scrollY - 200;
          window.scrollTo(0, y);
      } else {
          window.scrollTo(0, document.body.scrollHeight - 900);
      }
    }
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '../screenshots/03.png' });

  await context.close();
  await browser.close();
  console.log('Done!');
})();
