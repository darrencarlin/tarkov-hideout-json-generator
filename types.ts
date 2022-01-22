export interface Hideout {
  electronic_items: Item[];
  hardware_items: Item[];
  medical_items: Item[];
  valuable_items: Item[];
  modules: Module[];
  hideout_version: string;
  percentage: number;
  userId: string;
}

export interface Item {
  item: Items;
  priority: boolean;
  remaining: number;
  total: number;
}

export interface Module {
  complete: boolean;
  level: number;
  module: Modules;
  loyalty_requirements: Requirement[];
  item_requirements: ItemRequirement[];
  module_requirements: Requirement[];
  skill_requirements: Requirement[];
}

export interface ItemRequirement {
  category: Categories;
  complete: boolean;
  have: number;
  item: Items;
  need: number;
}

export type Categories =
  | "electronic_items"
  | "hardware_items"
  | "medical_items"
  | "valuable_items";

export interface Requirement {
  item: string;
}

export type Modules =
  | "Air Filtering Unit"
  | "Bitcoin Farm"
  | "Booze Generator"
  | "Generator"
  | "Heating"
  | "Illumination"
  | "Intelligence Center"
  | "Lavatory"
  | "Library"
  | "Medstation"
  | "Nutrition Unit"
  | "Rest Space"
  | "Scav Case"
  | "Security"
  | "Shooting Range"
  | "Solar Power"
  | "Stash"
  | "Vents"
  | "Water Collector"
  | "Workbench"
  | "Christmas Tree";

export type Items =
  | "6-STEN-140-M military battery"
  | "A pack of nails"
  | "A pack of screws"
  | "Toolset"
  | "Air filter for gas mask"
  | "Alkaline cleaner for heat exchangers"
  | "Analog Thermometer"
  | "Aseptic bandage"
  | "Bolts"
  | "Bronze lion"
  | "Bulbex cable cutter"
  | "CPU Fan"
  | "Capacitors"
  | "Car Battery"
  | "Chainlet"
  | "Classic matches"
  | "Coffee Majaica"
  | "Corrugated Hose"
  | "Crickent lighter"
  | "DVD drive"
  | "Damaged hard drive"
  | "Diary"
  | "Disposable syringe"
  | "Dry Fuel"
  | "Duct Tape"
  | "TP-200 TNT brick"
  | "Construction measuring tape"
  | "Electric Drill"
  | "Electric Motor"
  | "Pliers Elite"
  | "Energy-saving lamp"
  | "Esmarch tourniquet"
  | "Euro"
  | "Factory plan map"
  | "FireKlean Gun Lube"
  | "Folder with Intelligence"
  | "Gas Analyzer"
  | "Gold skull ring"
  | "Golden neck chain"
  | "Hand Drill"
  | "Horse figurine"
  | "Hunting matches"
  | "KEKTAPE"
  | "LEDX"
  | "Christmas tree ornament (Red)"
  | "Christmas tree ornament (White)"
  | "Christmas tree ornament (Violet)"
  | "Can of thermite"
  | "Leatherman Multitool"
  | "Fierce Hatchling moonshine"
  | "Lucky Scav Junk box"
  | "Light Bulb"
  | "Magnet"
  | "Medical Bloodset"
  | "Medical tools"
  | "Metal Spare Parts"
  | "Military COFDM"
  | "Military cable"
  | "Military corrugated tube"
  | "Military power filter"
  | "NIXXOR lens"
  | "Opthalmoscope"
  | "Phase Control Relay"
  | "Phased Array Element"
  | "Pile of meds"
  | "GreenBat lithium battery"
  | "Pipe grip wrench"
  | "Power Supply Unit"
  | "Powercord"
  | "Pressure Gauge"
  | "Printed Circuit Board"
  | "Radiator Helix"
  | "Roler Submariner gold wrist watch"
  | "Rubles"
  | "SSD Drive"
  | "Saline Solution"
  | "Screw Nut"
  | "Secure Flash Drive"
  | "Secured magnetic tape cassette"
  | "Shustrilo sealing foam"
  | "Silicone tube"
  | "Slim diary"
  | "Smoked Chimney drain cleaner"
  | "Soap"
  | "Sodium Bicarbonate"
  | "Spark plug"
  | "T-Shaped plug"
  | "Tech manual"
  | "Toilet paper"
  | "Toothpaste"
  | "Ratchet wrench"
  | "USD"
  | "VPX Flash Storage Module"
  | "WD-40 (100ml)"
  | "Wires"
  | "Working LCD"
  | "Wrench"
  | "Xenomorph sealing foam";
