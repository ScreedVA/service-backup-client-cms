import { writeBackup } from "./googleDriveClient";
import { queryCollection, queryGlobal } from "./PayloadClient";

interface BackupClient {
  clientName: "perfometrics" | "quantumelektro";
  domain: string;
  collectionSlugs: string[];
  globalSlugs: string[];
}

// Define the shape of your backup items
interface BackupItem {
  timestamp?: string; // Optional: you can add a timestamp for each item if needed
  data: any; // Replace 'any' with actual type if known
}

type BackupData = { units: BackupItem[] };

interface Clients {
  perfometrics: BackupData;
  quantumelektro: BackupData;
}

const backupClients: BackupClient[] = [
  {
    clientName: "perfometrics",
    domain: "perfometrics.co",
    // collectionSlugs: ["service", "articles", "expertise"],
    // globalSlugs: ["shared-section", "home", "about", "contact", "impressum"],
    collectionSlugs: ["service"],
    globalSlugs: ["shared-section"],
  },
  {
    clientName: "quantumelektro",
    domain: "quantumelektro.de",
    // collectionSlugs: ["services", "projects"],
    // globalSlugs: ["home", "contact", "aboutUs"],
    collectionSlugs: ["services"],
    globalSlugs: ["home"],
  },
];

let clientBackupData: Clients = {
  perfometrics: { units: [] },
  quantumelektro: { units: [] },
};

// Mock function to fetch backup data for a slug
async function fetchBackupData(domain: string, slug: string, type: "collection" | "global"): Promise<BackupItem> {
  // Replace this with actual fetch logic
  let response: any;
  console.log(`     🔄 Fetching ${type} data for slug: (${slug}) from domain: [${domain}]`);
  if (process.env.ENV === "production") {
    response = type === "collection" ? await queryCollection(domain, slug) : await queryGlobal(domain, slug);
  } else {
    response = {
      mockData: `Data for ${slug} from ${domain}`,
    };
  }

  return { data: response, timestamp: new Date().toISOString() };
}

export async function backup() {
  console.log(`🟢 Initializing (${process.env.ENV}) Backup...`);
  const backupStartTime = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

  try {
    for (const { clientName, domain, collectionSlugs, globalSlugs } of backupClients) {
      console.log(`   ⏩ Backing up client: (${domain})`);

      try {
        // Backup collections
        for (const slug of collectionSlugs) {
          const data = await fetchBackupData(domain, slug, "collection");
          clientBackupData[clientName].units.push({ data });
          await writeBackup(`${backupStartTime}/${clientName}/collections/${slug}.json`, data);
        }

        // Backup globals
        for (const slug of globalSlugs) {
          const data = await fetchBackupData(domain, slug, "global");
          clientBackupData[clientName].units.push({ data, timestamp: new Date().toISOString() });
          await writeBackup(`${backupStartTime}/${clientName}/globals/${slug}.json`, data);
        }

        console.log(`   ✅ Completed backup for client: ${domain}`);
      } catch (err) {
        console.error(`   ❌ Failed to backup client (${domain}):`, err);
      }
    }
    console.log("🟢 Completed All Backups");
    return clientBackupData;
  } catch (err: any) {
    console.error("⛔ Failed to backup :", err);
    return {
      error: err,
    };
  }
}
