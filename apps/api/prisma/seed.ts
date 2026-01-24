import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  // Read resume.json from web app
  const resumePath = path.join(__dirname, '../../../apps/web/src/data/resume.json');
  const resumeData = JSON.parse(fs.readFileSync(resumePath, 'utf-8'));

  // Upsert resume data
  await prisma.resume.upsert({
    where: { id: 'main' },
    update: { content: resumeData },
    create: { id: 'main', content: resumeData },
  });

  // Read portfolio.json from web app
  const portfolioPath = path.join(__dirname, '../../../apps/web/src/data/portfolio.json');
  const portfolioData = JSON.parse(fs.readFileSync(portfolioPath, 'utf-8'));

  // Upsert portfolio data
  await prisma.portfolio.upsert({
    where: { id: 'main' },
    update: { content: portfolioData },
    create: { id: 'main', content: portfolioData },
  });

  console.log('Seeded resume and portfolio data');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
