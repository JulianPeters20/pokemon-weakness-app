#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

const INPUT = path.resolve(__dirname, "data/Learnsets.c")
const OUTPUT = path.resolve(__dirname, "../src/data/generated/unboundLearnsets.ts")

function normalizeSpeciesKey(constName) {
  let key = constName.toLowerCase()
  const suffixReplacements = [
    ["_f", "-f"], ["_m", "-m"], ["_alola", "-alola"], ["_galar", "-galar"],
    ["_hisui", "-hisui"], ["_therian", "-therian"], ["_low_key", "-low-key"],
    ["_cap", "-cap"], ["_primal", "-primal"], ["_origin", "-origin"],
    ["_totem", "-totem"], ["_large", "-large"], ["_super", "-super"],
    ["_eternamax", "-eternamax"], ["_shadow", "-shadow"],
  ]
  for (const [s, r] of suffixReplacements) {
    if (key.endsWith(s)) { key = key.slice(0, -s.length) + r; break }
  }
  return key.replace(/_/g, "-")
}

function titleCaseHyphenated(name) {
  return name.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
}

async function buildMoveNameMap() {
  const map = new Map()

  // Manual overrides for names PokéAPI might not have or that need special handling
  const overrides = {
    ANCIENTPOWER: "Ancient Power",
    AURORAVEIL: "Aurora Veil",
    BONEMERANG: "Bone Rush",
    CHLOROBLAST: "Chloroblast",
    CONFUSION: "Confusion",
    COTTONGUARD: "Cotton Guard",
    CRABHAMMER: "Crabhammer",
    CROSSCHOP: "Cross Chop",
    CROSSPOISON: "Cross Poison",
    CRUSHCLAW: "Crush Claw",
    CRUSHPUNCH: "Crush Punch",
    CUT: "Cut",
    DARKPULSE: "Dark Pulse",
    DEFENSECURL: "Defense Curl",
    DIREBREATH: "Dire Breath",
    DOOMDESIRE: "Doom Desire",
    DOUBLEHIT: "Double Hit",
    DOUBLEIRONBASH: "Double Iron Bash",
    DRAINPUNCH: "Drain Punch",
    DRAGONASCENT: "Dragon Ascent",
    DRAGONBREATH: "Dragon Breath",
    DRAGONCLAW: "Dragon Claw",
    DRAGONDANCE: "Dragon Dance",
    DRAGONHAMMER: "Dragon Hammer",
    DRAGONPULSE: "Dragon Pulse",
    DRAGONRUSH: "Dragon Rush",
    DRAGONTAIL: "Dragon Tail",
    DRAININGKISS: "Draining Kiss",
    DRILLRUN: "Drill Run",
    DYNAMICPUNCH: "Dynamic Punch",
    ECHOEDVOICE: "Echoed Voice",
    ENERGYBALL: "Energy Ball",
    EXTRASENSORY: "Extrasensory",
    FALLINGICEBALL: "Falling Ice Ball",
    FEINT: "Feint",
    FIREFANG: "Fire Fang",
    FIREPUNCH: "Fire Punch",
    FIRESPIN: "Fire Spin",
    FLAMEBURST: "Flame Burst",
    FLAMECHARGE: "Flame Charge",
    FLAREBLITZ: "Flare Blitz",
    FLASHCANNON: "Flash Cannon",
    FLYINGPRESS: "Flying Press",
    FOCUSBLAST: "Focus Blast",
    FOCUSENERGY: "Focus Energy",
    FORCEPALM: "Force Palm",
    FURYSWIPES: "Fury Swipes",
    FURYCUTTER: "Fury Cutter",
    GIGADRAIN: "Giga Drain",
    GIGAIMPACT: "Giga Impact",
    GLACIATE: "Glaciate",
    GRASSWHISTLE: "Grass Whistle",
    GROWTH: "Growth",
    GUNKSHOT: "Gunk Shot",
    GUST: "Gust",
    GYROBALL: "Gyro Ball",
    HEADBUTT: "Headbutt",
    HEADCHARGE: "Head Charge",
    HEADLONGRUSH: "Headlong Rush",
    HEALBELL: "Heal Bell",
    HEATCRASH: "Heat Crash",
    HEATWAVE: "Heat Wave",
    HEAVYSLAM: "Heavy Slam",
    HIGHHORSEPOWER: "High Horsepower",
    HIGHJUMPKICK: "High Jump Kick",
    HORNATTACK: "Horn Attack",
    HORNLEECH: "Horn Leech",
    ICEBEAM: "Ice Beam",
    ICEBALL: "Ice Ball",
    ICEFANG: "Ice Fang",
    ICEHAMMER: "Ice Hammer",
    ICEPUNCH: "Ice Punch",
    ICESHARD: "Ice Shard",
    ICICLECRASH: "Icicle Crash",
    ICICLESPEAR: "Icicle Spear",
    ICYWIND: "Icy Wind",
    IRONDEFENSE: "Iron Defense",
    IRONHEAD: "Iron Head",
    IRONTAIL: "Iron Tail",
    JUMPKICK: "Jump Kick",
    KARATECHOP: "Karate Chop",
    LAIRONTAIL: "Lairon Tail",
    LASERFOCUS: "Laser Focus",
    LEAFBLADE: "Leaf Blade",
    LEAFSTORM: "Leaf Storm",
    LEECHLIFE: "Leech Life",
    LICK: "Lick",
    LOCKON: "Lock-On",
    LOVELYKISS: "Lovely Kiss",
    LOWKICK: "Low Kick",
    LOWSWEEP: "Low Sweep",
    LUNARDANCE: "Lunar Dance",
    LUSTERPURGE: "Luster Purge",
    MEGADRAIN: "Mega Drain",
    MEGAHORN: "Megahorn",
    MEGAKICK: "Mega Kick",
    MEGAPUNCH: "Mega Punch",
    METEORBEAM: "Meteor Beam",
    METEORMASH: "Meteor Mash",
    MILKDRINK: "Milk Drink",
    MISTBALL: "Mist Ball",
    MOONBLAST: "Moonblast",
    MOONLIGHT: "Moonlight",
    MOONSONG: "Moonsong",
    MOUNTAINGALE: "Mountain Gale",
    MUDBOMB: "Mud Bomb",
    MUDSHOT: "Mud Shot",
    MUDSLAP: "Mud-Slap",
    MUDDYWATER: "Muddy Water",
    MYSTICALFIRE: "Mystical Fire",
    NEEDLEARM: "Needle Arm",
    NIGHTSHADE: "Night Shade",
    NIGHTSLASH: "Night Slash",
    NUKEPOWER: "Nuke Power",
    OCTAZOOKA: "Octazooka",
    OMINOUSWIND: "Ominous Wind",
    PARABOLICCHARGE: "Parabolic Charge",
    PAYBACK: "Payback",
    PETALBLIZZARD: "Petal Blizzard",
    PETALDANCE: "Petal Dance",
    PINMISSILE: "Pin Missile",
    PLASMAFISTS: "Plasma Fists",
    PLAYROUGH: "Play Rough",
    POISONFANG: "Poison Fang",
    POISONJAB: "Poison Jab",
    POISONPOWDER: "Poison Powder",
    POISONSTING: "Poison Sting",
    POWDERSNOW: "Powder Snow",
    POWERGEM: "Power Gem",
    POWERWHIP: "Power Whip",
    PSYBEAM: "Psybeam",
    PSYCHICFANGS: "Psychic Fangs",
    PSYCHOCUT: "Psycho Cut",
    PSYSHOCK: "Psyshock",
    QUICKATTACK: "Quick Attack",
    RAINDANCE: "Rain Dance",
    RAZORLEAF: "Razor Leaf",
    RAZORSHELL: "Razor Shell",
    ROCKBLAST: "Rock Blast",
    ROCKPOLISH: "Rock Polish",
    ROCKSLIDE: "Rock Slide",
    ROCKTHROW: "Rock Throw",
    ROCKTOMB: "Rock Tomb",
    ROLLINGKICK: "Rolling Kick",
    ROLLOUT: "Rollout",
    SACREDFIRE: "Sacred Fire",
    SACREDSWORD: "Sacred Sword",
    SANDATTACK: "Sand Attack",
    SANDTOMB: "Sand Tomb",
    SCORCHINGSANDS: "Scorching Sands",
    SEEDBOMB: "Seed Bomb",
    SHADOWBALL: "Shadow Ball",
    SHADOWBONE: "Shadow Bone",
    SHADOWCLAW: "Shadow Claw",
    SHADOWFORCE: "Shadow Force",
    SHADOWPUNCH: "Shadow Punch",
    SHADOWSNEAK: "Shadow Sneak",
    SHEERCOLD: "Sheer Cold",
    SIGNALBEAM: "Signal Beam",
    SILVERWIND: "Silver Wind",
    SKULLBASH: "Skull Bash",
    SLASH: "Slash",
    SLEEPPOWDER: "Sleep Powder",
    SMARTSTRIKE: "Smart Strike",
    SMOG: "Smog",
    SMOKESCREEN: "Smokescreen",
    SNAP: "Snap",
    SOLARBEAM: "Solar Beam",
    SOLARBLADE: "Solar Blade",
    SPIKECANNON: "Spike Cannon",
    SPIKES: "Spikes",
    STEALTHROCK: "Stealth Rock",
    STEELBEAM: "Steel Beam",
    STEELROLLER: "Steel Roller",
    STEELWING: "Steel Wing",
    STOMPINGTANTRUM: "Stomping Tantrum",
    STONEEDGE: "Stone Edge",
    STOREDPOWER: "Stored Power",
    STORMTHROW: "Storm Throw",
    STRENGTH: "Strength",
    STRENGTHSAP: "Strength Sap",
    STRUGGLEBUG: "Struggle Bug",
    STUNSPORE: "Stun Spore",
    SUBMISSION: "Submission",
    SUCKERPUNCH: "Sucker Punch",
    SUNNYDAY: "Sunny Day",
    SUPERFANG: "Super Fang",
    SUPERPOWER: "Superpower",
    SUPERSONIC: "Supersonic",
    SURF: "Surf",
    SWEETKISS: "Sweet Kiss",
    SWEETSCENT: "Sweet Scent",
    SWIFT: "Swift",
    SWORDSDANCE: "Swords Dance",
    SYNTHESIS: "Synthesis",
    TAILSLAP: "Tail Slap",
    TAILWHIP: "Tail Whip",
    TAKEDOWN: "Take Down",
    TEETERDANCE: "Teeter Dance",
    THIEF: "Thief",
    THRASH: "Thrash",
    THUNDERBOLT: "Thunderbolt",
    THUNDERFANG: "Thunder Fang",
    THUNDERPUNCH: "Thunder Punch",
    THUNDERSHOCK: "Thunder Shock",
    THUNDERWAVE: "Thunder Wave",
    TICKLE: "Tickle",
    TOXIC: "Toxic",
    TOXICSPIKES: "Toxic Spikes",
    TRIATTACK: "Tri Attack",
    TRIPLEAXEL: "Triple Axel",
    TRIPLEKICK: "Triple Kick",
    TWINEEDLE: "Twineedle",
    TWISTERS: "Twisters",
    UTURN: "U-turn",
    VICEGRIP: "Vice Grip",
    VINEWHIP: "Vine Whip",
    VITALTHROW: "Vital Throw",
    VOLTSWITCH: "Volt Switch",
    WAKEUPSLAP: "Wake-Up Slap",
    WATERFALL: "Waterfall",
    WATERGUN: "Water Gun",
    WATERPULSE: "Water Pulse",
    WEATHERBALL: "Weather Ball",
    WHIRLPOOL: "Whirlpool",
    WILDCHARGE: "Wild Charge",
    WILLOWISP: "Will-O-Wisp",
    WINGATTACK: "Wing Attack",
    WISH: "Wish",
    WOODHAMMER: "Wood Hammer",
    WORRYSEED: "Worry Seed",
    XSCISSOR: "X-Scissor",
    ZAPCANNON: "Zap Cannon",
    ZENHEADBUTT: "Zen Headbutt",
  }

  for (const [k, v] of Object.entries(overrides)) map.set(k.toUpperCase(), v)

  try {
    const res = await fetch("https://pokeapi.co/api/v2/move?limit=1000&offset=0")
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    for (const entry of data.results) {
      const normalized = entry.name.replace(/-/g, "").toUpperCase()
      if (!map.has(normalized)) {
        map.set(normalized, titleCaseHyphenated(entry.name))
      }
    }
  } catch (e) {
    console.warn("Could not fetch PokéAPI move list, using only manual mapping:", e.message)
  }

  map.set("VCREATE", "V Create")
  return map
}

async function main() {
  const raw = fs.readFileSync(INPUT, "utf-8")
  const moveNameMap = await buildMoveNameMap()

  // Phase 1: parse learnset arrays
  const learnsetArrays = new Map()
  const arrayRegex = /static const struct LevelUpMove\s+s(\w+)LevelUpLearnset\[\]\s*=\s*\{([\s\S]*?)\}\s*;/g
  let match
  while ((match = arrayRegex.exec(raw)) !== null) {
    const arrayName = "s" + match[1] + "LevelUpLearnset"
    const body = match[2]
    const moveRegex = /LEVEL_UP_MOVE\s*\(\s*(\d+)\s*,\s*(MOVE_\w+)\s*\)/g
    const moves = []
    let m
    while ((m = moveRegex.exec(body)) !== null) {
      const level = parseInt(m[1], 10)
      moves.push({ level: level === 0 ? 1 : level, move: m[2] })
    }
    if (moves.length > 0) learnsetArrays.set(arrayName, moves)
  }

  // Phase 2: parse species mapping table
  const tableStart = raw.indexOf("const struct LevelUpMove* const gLevelUpLearnsets[NUM_SPECIES]")
  const tableSection = raw.slice(tableStart)
  const speciesToMoves = new Map()
  const mappingRegex = /\[\s*SPECIES_(\w+)\s*\]\s*=\s*s(\w+)LevelUpLearnset/g
  let mappingMatch
  while ((mappingMatch = mappingRegex.exec(tableSection)) !== null) {
    const speciesConst = mappingMatch[1]
    const arrayName = "s" + mappingMatch[2] + "LevelUpLearnset"

    if (speciesConst.includes("_MEGA") || speciesConst.includes("_GIGA") ||
        speciesConst === "MISSINGNO" || speciesConst === "NONE") continue

    const moves = learnsetArrays.get(arrayName)
    if (!moves || moves.length === 0) continue

    speciesToMoves.set(normalizeSpeciesKey(speciesConst), moves)
  }

  // Phase 3: build output
  const sortedKeys = Array.from(speciesToMoves.keys()).sort()
  const lines = [
    "// Auto-generated by scripts/convertLearnsets.cjs",
    "// Do not edit manually.",
    "",
    "export type UnboundLearnsetMove = {",
    "  level: number",
    "  move: string",
    "}",
    "",
    "export type UnboundLearnsets = Record<string, UnboundLearnsetMove[]>",
    "",
    "export const UNBOUND_LEARNSETS: UnboundLearnsets = {",
  ]

  for (const key of sortedKeys) {
    const moves = speciesToMoves.get(key)
    lines.push(`  ${JSON.stringify(key)}: [`)
    for (const mv of moves) {
      const constSuffix = mv.move.replace(/^MOVE_/, "")
      const display = moveNameMap.get(constSuffix) || titleCaseHyphenated(constSuffix.toLowerCase().replace(/_/g, "-"))
      lines.push(`    { level: ${mv.level}, move: ${JSON.stringify(display)} },`)
    }
    lines.push("  ],")
  }

  lines.push("}")
  lines.push("")

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true })
  fs.writeFileSync(OUTPUT, lines.join("\n"), "utf-8")

  console.log(`Generated ${OUTPUT}`)
  console.log(`  Species count: ${speciesToMoves.size}`)
}

main().catch(err => { console.error(err); process.exit(1) })
