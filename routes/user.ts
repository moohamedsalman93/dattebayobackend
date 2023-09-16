import express, { Request, Response, response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import puppeteer from 'puppeteer';
import fs from 'fs';
import { promisify } from 'util';
import pdf from 'pdf-parse';

const prisma = new PrismaClient();

export const userRouter = express.Router();

userRouter.get("/user", getData);
userRouter.get("/dep", getDep);
userRouter.get("/getScrapper", getScrapper);
// userRouter.get("/gender", genDer);


async function getDep(req: Request, res: Response) {

  try {
    const depData = await prisma.depTable.findMany();

    if (!depData) {
      return res.status(500).json({ error: { message: "no Data" } });
    }


    res.json({
      success: {
        data: depData,
      },
    });
  } catch (e) {
    console.log(e)
    return res.status(500).json({ error: { message: "Internal server error" } });
  }
}

async function genDer() {

  for (let i = 43; i <= 55; i++) {
    try {
      const prevMaterial = await prisma.user.findFirst({
        where: {
          regno: ` 22UZO${i.toString().padStart(3, '0')}`
        }
      })

      console.log(prevMaterial)

      if (prevMaterial) {
        let data: any = {};

        data.gen = "female"

        const sa = await prisma.user.update({
          data: data,
          where: {
            id: prevMaterial.id
          }
        });

        console.log(sa)
      }

    } catch (e) {
      console.log(e)
    }
  }

}

async function getData(req: Request, res: Response) {
  const reqPage = req.query.page;
  const maxResults = req.query.maxResults ? parseInt(req.query.maxResults.toString()) : undefined;

  let page = 1;

  if (!reqPage) {
    page = 1;
  } else {
    const reqPageNum = parseInt(reqPage.toString());
    if (isNaN(reqPageNum)) {
      page = 1;
    } else {
      page = reqPageNum;
    }
  }

  try {
    let maxPages = 1;
    let materialCount;


    let whereCond: any = {
      OR: [
        {
          name: {
            contains: req.query.name,
            mode: 'insensitive',
          },
        },
        {
          regno: {
            contains: req.query.name,
            mode: 'insensitive',
          },
        },
        {
          dob: {
            contains: req.query.name,
            mode: 'insensitive',
          },
        },
      ],
    };

    if (req.query.filterdep) {
      whereCond.filterdep = {
        equals: req.query.filterdep, // Assuming department is a field in your database
      };
    }

    if (req.query.year) {
      whereCond.regno = {
        contains: req.query.year, // Use "contains" to search for "22" anywhere in the regno field
        mode: 'insensitive',
      };
    }

    if (req.query.g) {
      whereCond.gen = {
        contains: req.query.g, 
        mode: 'insensitive',
      };
    }

    let takeCount = 20;
    if (maxResults && !isNaN(maxResults)) {
      takeCount = Math.min(maxResults, 20);
    }

    const material = await prisma.user.findMany({
      skip: (page - 1) * 20,
      take: takeCount,
      where: whereCond,
    });

    if (!material) {
      return res.status(500).json({ error: { message: "no Data" } });
    }

    if (req.query.name || req.query.filterdep || req.query.year || req.query.g) {
      materialCount = await prisma.user.count({
        where: whereCond,
      });
    } else {
      materialCount = await prisma.user.count();
    }

    if (materialCount) {
      maxPages = Math.ceil(materialCount / 20);
    }

    if (page > maxPages) {
      return res.status(409).json({
        error: {
          message: "The requested page not found",
        },
      });
    }

    res.json({
      success: {
        data: material,
        maxPages: maxPages,
        currentPage: page,
        length: material.length,
      },
    });
  } catch (e) {
    return res.status(500).json({ error: { message: "Internal server error" } });
  }
}

async function getScrapper(req:Request,res:Response) {
  try {
    const browser = await puppeteer.launch({ headless: 'new',
      args: [
        // Set the download directory to the desired path
        '--download.default_directory=./mis', // Use './' for the current directory
        // Set the desired filename for the downloaded PDF
        `--download.default_filename=salman.pdf`, // Specify the desired filename
        '--download.prompt_for_download=false', // Disable download prompts
      ],
  });
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(60000);

    await page.goto('https://jmcerp.in/studentlogin');

    await page.type('#txtuname', '22MCA070');
    await page.type('#txtpassword', '22022002');
    await page.click('#Button1');
    await page.waitForSelector('#ImageUpDown');
    await page.click('#ImageUpDown');
    await page.waitForSelector('#ImageButtonbioDATA');
    await page.click('#ImageButtonbioDATA');
    await page.waitForTimeout(5000);
    await page.click('#ImageButtonbioDATA');
    await page.setRequestInterception(true);

    page.on('request', (request) => {
      if (request.method() === 'GET') {
        console.log('Captured GET request:', request.url());
      }
      request.continue(); // Continue the request as normal
    });

    // Wait for a while to capture the network requests
    await page.waitForTimeout(5000);

    // Disable request interception
    await page.setRequestInterception(false);


    res.status(200).send('Puppeteer actions triggered successfully.');
  } catch (error) {
    console.error('Error triggering Puppeteer:', error);
    res.status(500).send('Internal Server Error');
  }
}