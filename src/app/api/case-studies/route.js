import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { NextResponse } from "next/server";

const DATA_DIR = join(process.cwd(), "data");
const DATA_FILE = join(DATA_DIR, "case-studies.json");

/**
 * Ensure data directory and file exist
 */
async function ensureDataFile() {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
  if (!existsSync(DATA_FILE)) {
    await writeFile(DATA_FILE, "[]", "utf-8");
  }
}

/**
 * Read all case studies from the JSON file
 */
async function readCaseStudies() {
  await ensureDataFile();
  const data = await readFile(DATA_FILE, "utf-8");
  return JSON.parse(data);
}

/**
 * Write case studies to the JSON file
 */
async function writeCaseStudies(caseStudies) {
  await ensureDataFile();
  await writeFile(DATA_FILE, JSON.stringify(caseStudies, null, 2), "utf-8");
}

/**
 * GET /api/case-studies
 * Returns all saved case studies
 */
export async function GET() {
  try {
    const caseStudies = await readCaseStudies();
    return NextResponse.json(caseStudies);
  } catch (error) {
    console.error("Error reading case studies:", error);
    return NextResponse.json(
      { error: "Failed to read case studies" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/case-studies
 * Create a new case study
 */
export async function POST(request) {
  try {
    const caseStudy = await request.json();

    // Validate required fields
    if (!caseStudy.id || !caseStudy.name) {
      return NextResponse.json(
        { error: "Missing required fields: id, name" },
        { status: 400 }
      );
    }

    const caseStudies = await readCaseStudies();

    // Check for duplicate ID
    const existingIndex = caseStudies.findIndex((cs) => cs.id === caseStudy.id);
    if (existingIndex >= 0) {
      // Update existing
      caseStudies[existingIndex] = caseStudy;
    } else {
      // Add new
      caseStudies.push(caseStudy);
    }

    await writeCaseStudies(caseStudies);

    return NextResponse.json(caseStudy, { status: 201 });
  } catch (error) {
    console.error("Error creating case study:", error);
    return NextResponse.json(
      { error: "Failed to create case study" },
      { status: 500 }
    );
  }
}
