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
 * GET /api/case-studies/[id]
 * Get a single case study by ID
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const caseStudies = await readCaseStudies();
    const caseStudy = caseStudies.find((cs) => cs.id === id);

    if (!caseStudy) {
      return NextResponse.json(
        { error: "Case study not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(caseStudy);
  } catch (error) {
    console.error("Error reading case study:", error);
    return NextResponse.json(
      { error: "Failed to read case study" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/case-studies/[id]
 * Update a case study
 */
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const updates = await request.json();

    const caseStudies = await readCaseStudies();
    const index = caseStudies.findIndex((cs) => cs.id === id);

    if (index === -1) {
      return NextResponse.json(
        { error: "Case study not found" },
        { status: 404 }
      );
    }

    // Merge updates with existing data
    caseStudies[index] = { ...caseStudies[index], ...updates, id };

    await writeCaseStudies(caseStudies);

    return NextResponse.json(caseStudies[index]);
  } catch (error) {
    console.error("Error updating case study:", error);
    return NextResponse.json(
      { error: "Failed to update case study" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/case-studies/[id]
 * Delete a case study
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const caseStudies = await readCaseStudies();
    const index = caseStudies.findIndex((cs) => cs.id === id);

    if (index === -1) {
      return NextResponse.json(
        { error: "Case study not found" },
        { status: 404 }
      );
    }

    const deleted = caseStudies.splice(index, 1)[0];
    await writeCaseStudies(caseStudies);

    return NextResponse.json({ success: true, deleted });
  } catch (error) {
    console.error("Error deleting case study:", error);
    return NextResponse.json(
      { error: "Failed to delete case study" },
      { status: 500 }
    );
  }
}
