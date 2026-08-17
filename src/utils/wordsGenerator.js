import { isNearTierThreshold } from './wordsCurriculum.js';

export const WORD_LISTS = {
  "1": [
    {
      "word": "cat",
      "hint": "A friendly pet that meows and purrs."
    },
    {
      "word": "bat",
      "hint": "A flying animal or a wooden stick used in baseball."
    },
    {
      "word": "hat",
      "hint": "Something cozy you wear on your head."
    },
    {
      "word": "mat",
      "hint": "A small rug placed on the floor near the doorway."
    },
    {
      "word": "rat",
      "hint": "A furry little animal with whiskers and a long tail."
    },
    {
      "word": "cap",
      "hint": "A hat with a curved visor in the front."
    },
    {
      "word": "map",
      "hint": "A colorful drawing showing roads, towns, and rivers."
    },
    {
      "word": "tap",
      "hint": "To touch something lightly or where water flows out."
    },
    {
      "word": "nap",
      "hint": "A short, refreshing sleep during the afternoon."
    },
    {
      "word": "bag",
      "hint": "A container made of cloth or paper used to carry things."
    },
    {
      "word": "tag",
      "hint": "A label on a shirt or a fun playground chasing game."
    },
    {
      "word": "rag",
      "hint": "A soft piece of cloth used for wiping up spills."
    },
    {
      "word": "van",
      "hint": "A spacious motor vehicle larger than a car."
    },
    {
      "word": "pan",
      "hint": "A metal cooking dish with a handle used on the stove."
    },
    {
      "word": "fan",
      "hint": "A machine with spinning blades that blows cool air."
    },
    {
      "word": "man",
      "hint": "A grown-up male person."
    },
    {
      "word": "jam",
      "hint": "Sweet fruit spread made from berries for toast."
    },
    {
      "word": "ham",
      "hint": "A slice of food often served for lunch in sandwiches."
    },
    {
      "word": "dad",
      "hint": "A loving father."
    },
    {
      "word": "cab",
      "hint": "A yellow taxi car that gives people rides."
    },
    {
      "word": "lab",
      "hint": "A room where scientists do exciting experiments."
    },
    {
      "word": "wax",
      "hint": "The smooth material that melts on a birthday candle."
    },
    {
      "word": "pad",
      "hint": "A stack of paper sheets for drawing or writing notes."
    },
    {
      "word": "sad",
      "hint": "Feeling down; the opposite of cheerful."
    },
    {
      "word": "lad",
      "hint": "A friendly word for a young boy."
    },
    {
      "word": "tab",
      "hint": "A small flap you click or pull on a folder or screen."
    },
    {
      "word": "wag",
      "hint": "What a happy puppy does with its tail."
    },
    {
      "word": "gap",
      "hint": "An open space between two things."
    },
    {
      "word": "lap",
      "hint": "The flat area between your knees when sitting."
    },
    {
      "word": "can",
      "hint": "A metal container holding soup or juice."
    },
    {
      "word": "ran",
      "hint": "Moved fast on foot in the past."
    },
    {
      "word": "tan",
      "hint": "A light golden-brown color like sand."
    },
    {
      "word": "yam",
      "hint": "A sweet orange root vegetable similar to a potato."
    },
    {
      "word": "ram",
      "hint": "A male sheep with big curled horns."
    },
    {
      "word": "dam",
      "hint": "A strong wall built across a river to hold back water."
    },
    {
      "word": "pat",
      "hint": "A gentle tap on the shoulder or a puppy head."
    },
    {
      "word": "sat",
      "hint": "Rested on a chair or bench in the past."
    },
    {
      "word": "gas",
      "hint": "Fuel used to power vehicles, or a state of matter."
    },
    {
      "word": "sap",
      "hint": "Sweet liquid inside a maple tree used for syrup."
    },
    {
      "word": "fax",
      "hint": "A printed message sent across a phone wire."
    },
    {
      "word": "bed",
      "hint": "A soft, warm place where you sleep at night."
    },
    {
      "word": "red",
      "hint": "The bright color of a ripe strawberry or a stop sign."
    },
    {
      "word": "net",
      "hint": "Interwoven strings used to catch a soccer ball or fish."
    },
    {
      "word": "pet",
      "hint": "A cuddly animal companion like a puppy or kitten."
    },
    {
      "word": "wet",
      "hint": "Covered with water or raindrops; not dry."
    },
    {
      "word": "set",
      "hint": "A collection of matching items that go together, like building blocks or dishes."
    },
    {
      "word": "ten",
      "hint": "The number that comes right after nine (10)."
    },
    {
      "word": "pen",
      "hint": "An instrument used for writing with colored ink."
    },
    {
      "word": "hen",
      "hint": "A female chicken that clucks and lays fresh eggs."
    },
    {
      "word": "men",
      "hint": "More than one adult male person."
    },
    {
      "word": "leg",
      "hint": "The lower body limb used for walking and jumping."
    },
    {
      "word": "peg",
      "hint": "A small wooden or plastic pin on a coat rack."
    },
    {
      "word": "jet",
      "hint": "A fast airplane powered by powerful engines."
    },
    {
      "word": "web",
      "hint": "A delicate silky net spun by a garden spider."
    },
    {
      "word": "gem",
      "hint": "A precious, sparkling jewel like a ruby or emerald."
    },
    {
      "word": "den",
      "hint": "A cozy home for a bear or a comfortable family room."
    },
    {
      "word": "vet",
      "hint": "An animal doctor who helps sick pets get well."
    },
    {
      "word": "fed",
      "hint": "Gave yummy food to a pet or friend."
    },
    {
      "word": "led",
      "hint": "Guided others along a path in the past."
    },
    {
      "word": "get",
      "hint": "To receive, obtain, or fetch something."
    },
    {
      "word": "let",
      "hint": "To give permission or allow something to happen."
    },
    {
      "word": "met",
      "hint": "Shook hands with a new friend in the past."
    },
    {
      "word": "beg",
      "hint": "To ask very politely or nicely for a treat."
    },
    {
      "word": "egg",
      "hint": "An oval shell laid by birds that you can scramble."
    },
    {
      "word": "hem",
      "hint": "The folded and stitched bottom edge of a dress or shirt."
    },
    {
      "word": "yes",
      "hint": "A positive answer; the opposite of no."
    },
    {
      "word": "yet",
      "hint": "Up until now; as of this moment."
    },
    {
      "word": "wed",
      "hint": "To unite in marriage during a joyful celebration."
    },
    {
      "word": "bet",
      "hint": "A friendly wager on who wins a race."
    },
    {
      "word": "dew",
      "hint": "Sparkling morning water droplets on grass blades."
    },
    {
      "word": "few",
      "hint": "A small number of items; not very many."
    },
    {
      "word": "new",
      "hint": "Recently made or bought; not old."
    },
    {
      "word": "sew",
      "hint": "To stitch fabric together with needle and thread."
    },
    {
      "word": "pig",
      "hint": "A cheerful pink farm animal that says oink."
    },
    {
      "word": "big",
      "hint": "Very large in size; the opposite of tiny."
    },
    {
      "word": "dig",
      "hint": "To scoop up dirt with a garden shovel."
    },
    {
      "word": "wig",
      "hint": "A cap made of artificial hair worn in costumes."
    },
    {
      "word": "pin",
      "hint": "A tiny pointed metal fastener used on clothing."
    },
    {
      "word": "win",
      "hint": "To be first in a race or achieve victory in a game."
    },
    {
      "word": "bin",
      "hint": "A storage box used to organize toys or recycling."
    },
    {
      "word": "tin",
      "hint": "A shiny silver metal used to make cans."
    },
    {
      "word": "lip",
      "hint": "Either of the two soft edges of your mouth."
    },
    {
      "word": "tip",
      "hint": "The very top point of a pencil or helpful advice."
    },
    {
      "word": "sip",
      "hint": "To drink a small amount of lemonade slowly."
    },
    {
      "word": "rip",
      "hint": "To tear paper or fabric apart gently."
    },
    {
      "word": "sit",
      "hint": "To rest comfortably on a chair."
    },
    {
      "word": "hit",
      "hint": "To tap a baseball with a wooden bat."
    },
    {
      "word": "fit",
      "hint": "Just the right size; also healthy and strong."
    },
    {
      "word": "lid",
      "hint": "A removable top cover for a jar or teapot."
    },
    {
      "word": "kid",
      "hint": "A cheerful young child or a baby goat."
    },
    {
      "word": "fix",
      "hint": "To repair a toy that is broken."
    },
    {
      "word": "mix",
      "hint": "To stir different ingredients together in a bowl."
    },
    {
      "word": "six",
      "hint": "The number between five and seven (6)."
    },
    {
      "word": "rib",
      "hint": "One of the curved bones protecting your chest."
    },
    {
      "word": "bib",
      "hint": "A cloth tied around a baby neck during meals."
    },
    {
      "word": "dip",
      "hint": "To lower something quickly into water or salsa."
    },
    {
      "word": "hip",
      "hint": "The side of your body just below your waist."
    },
    {
      "word": "zip",
      "hint": "To fasten a warm jacket with interlocking sliding teeth."
    },
    {
      "word": "bit",
      "hint": "A tiny piece, or chewed a small piece off a crunchy apple."
    },
    {
      "word": "kit",
      "hint": "A collection of special supplies or tools for crafts or first aid."
    },
    {
      "word": "lit",
      "hint": "Brightened with a candle or flashlight."
    },
    {
      "word": "pit",
      "hint": "The large hard seed inside a peach or cherry."
    },
    {
      "word": "hid",
      "hint": "Stayed concealed out of sight during a game."
    },
    {
      "word": "did",
      "hint": "Completed a chore or activity in the past."
    },
    {
      "word": "fin",
      "hint": "The wing-like part a fish uses to swim."
    },
    {
      "word": "fig",
      "hint": "A sweet, soft purple fruit with tiny seeds inside."
    },
    {
      "word": "rig",
      "hint": "A large truck or special sailing equipment on a ship."
    },
    {
      "word": "kin",
      "hint": "Your family relatives and loved ones."
    },
    {
      "word": "rim",
      "hint": "The outer curved edge of a basketball hoop or wheel."
    },
    {
      "word": "dim",
      "hint": "Softly lit; not very bright."
    },
    {
      "word": "jig",
      "hint": "A lively, cheerful jumping dance."
    },
    {
      "word": "dog",
      "hint": "A loyal pet that wags its tail and barks happily."
    },
    {
      "word": "log",
      "hint": "A thick section of a cut tree trunk for a campfire."
    },
    {
      "word": "fog",
      "hint": "A misty cloud resting low right above the ground."
    },
    {
      "word": "box",
      "hint": "A cardboard container used for wrapping presents."
    },
    {
      "word": "fox",
      "hint": "A clever woodland animal with a bushy reddish tail."
    },
    {
      "word": "top",
      "hint": "The highest point of a hill, or a spinning toy."
    },
    {
      "word": "hop",
      "hint": "To jump lightly on one foot like a happy bunny."
    },
    {
      "word": "pop",
      "hint": "A quick burst sound made when a soapy balloon or bubble bursts."
    },
    {
      "word": "mop",
      "hint": "A cleaning tool with soft yarn used to wash floors."
    },
    {
      "word": "pot",
      "hint": "A deep metal container for cooking vegetable soup."
    },
    {
      "word": "hot",
      "hint": "Having a warm temperature; the opposite of cold."
    },
    {
      "word": "dot",
      "hint": "A tiny round mark, like the small point above the letter i."
    },
    {
      "word": "rod",
      "hint": "A long slender pole used for fishing."
    },
    {
      "word": "jog",
      "hint": "To run at a steady, gentle, healthy pace."
    },
    {
      "word": "cob",
      "hint": "The hard yellow core that holds sweet corn kernels."
    },
    {
      "word": "pod",
      "hint": "The green shell that holds sweet little peas."
    },
    {
      "word": "nod",
      "hint": "To move your head up and down to say yes."
    },
    {
      "word": "lot",
      "hint": "A large amount of something, or an open plot of land."
    },
    {
      "word": "cot",
      "hint": "A lightweight narrow folding bed used for camping."
    },
    {
      "word": "rot",
      "hint": "What fallen autumn leaves naturally do to feed soil."
    },
    {
      "word": "got",
      "hint": "Received something in the past."
    },
    {
      "word": "not",
      "hint": "A word used to mean no or the opposite."
    },
    {
      "word": "mom",
      "hint": "A loving mother."
    },
    {
      "word": "bog",
      "hint": "A wet spongy ground with peat and moss."
    },
    {
      "word": "cog",
      "hint": "A toothed wheel that meshes with another in a machine."
    },
    {
      "word": "hog",
      "hint": "A large farm pig."
    },
    {
      "word": "cop",
      "hint": "A friendly police officer helping in the community."
    },
    {
      "word": "mow",
      "hint": "To trim the green lawn grass."
    },
    {
      "word": "row",
      "hint": "To paddle a canoe forward across a lake."
    },
    {
      "word": "bow",
      "hint": "A tied ribbon ornament on a gift."
    },
    {
      "word": "sow",
      "hint": "To scatter seeds into garden soil."
    },
    {
      "word": "tow",
      "hint": "To pull another vehicle behind with a rope."
    },
    {
      "word": "cow",
      "hint": "A gentle farm animal that says moo."
    },
    {
      "word": "how",
      "hint": "In what way or manner."
    },
    {
      "word": "now",
      "hint": "At the present exact moment."
    },
    {
      "word": "owl",
      "hint": "A wise bird of prey that hoots in the night."
    },
    {
      "word": "sun",
      "hint": "The bright glowing star that lights up our daytime sky."
    },
    {
      "word": "run",
      "hint": "To move quickly on your feet."
    },
    {
      "word": "bus",
      "hint": "A big yellow vehicle that takes students to school."
    },
    {
      "word": "cup",
      "hint": "A small container with a handle for drinking juice."
    },
    {
      "word": "bug",
      "hint": "A tiny crawling insect in the garden."
    },
    {
      "word": "hug",
      "hint": "To wrap your arms around someone you love."
    },
    {
      "word": "mug",
      "hint": "A sturdy cup used for warm hot chocolate."
    },
    {
      "word": "jug",
      "hint": "A large container with a spout for pouring milk."
    },
    {
      "word": "rug",
      "hint": "A decorative soft mat on the living room floor."
    },
    {
      "word": "mud",
      "hint": "Soft, wet earth after a refreshing rain shower."
    },
    {
      "word": "nut",
      "hint": "A crunchy seed inside a hard shell, like a walnut."
    },
    {
      "word": "hut",
      "hint": "A small, simple cabin made of logs or straw."
    },
    {
      "word": "tub",
      "hint": "A large basin where you take bubble baths."
    },
    {
      "word": "gum",
      "hint": "Chewy candy with fruity flavor."
    },
    {
      "word": "pup",
      "hint": "A baby dog that loves to play and tumble."
    },
    {
      "word": "fun",
      "hint": "Enjoyable activities that make you smile and laugh."
    },
    {
      "word": "bun",
      "hint": "A round, soft bread roll for a veggie sandwich."
    },
    {
      "word": "cub",
      "hint": "A cute young baby bear or lion."
    },
    {
      "word": "sub",
      "hint": "A long sandwich roll or an underwater boat."
    },
    {
      "word": "rub",
      "hint": "To move your hand back and forth over a surface."
    },
    {
      "word": "tug",
      "hint": "To pull something firmly with a rope."
    },
    {
      "word": "hum",
      "hint": "To make musical notes with your lips closed."
    },
    {
      "word": "bud",
      "hint": "A baby flower getting ready to bloom in spring."
    },
    {
      "word": "cut",
      "hint": "To divide paper into shapes using safety scissors."
    },
    {
      "word": "gut",
      "hint": "Your tummy or inner instinct."
    },
    {
      "word": "rut",
      "hint": "A groove in a dirt path made by bicycle wheels."
    },
    {
      "word": "hub",
      "hint": "The central middle part of a spinning wheel."
    },
    {
      "word": "yum",
      "hint": "What you say when eating something delicious."
    },
    {
      "word": "sum",
      "hint": "The total answer when you add numbers together."
    },
    {
      "word": "pug",
      "hint": "A small dog with a wrinkled face and curled tail."
    },
    {
      "word": "nun",
      "hint": "A woman devoted to religious life in a convent."
    },
    {
      "word": "pun",
      "hint": "A playful joke that uses the double meaning of words."
    },
    {
      "word": "mum",
      "hint": "A lovely autumn garden flower (chrysanthemum)."
    },
    {
      "word": "one",
      "hint": "The number that begins counting (1)."
    },
    {
      "word": "two",
      "hint": "The number that comes right after one (2)."
    },
    {
      "word": "see",
      "hint": "To look at the world with your eyes."
    },
    {
      "word": "fly",
      "hint": "To glide through the air using wings."
    },
    {
      "word": "sky",
      "hint": "The high blue ceiling above where clouds drift."
    },
    {
      "word": "day",
      "hint": "The bright hours between sunrise and sunset."
    },
    {
      "word": "boy",
      "hint": "A young male child."
    },
    {
      "word": "toy",
      "hint": "An item made for playing and having fun."
    },
    {
      "word": "joy",
      "hint": "A feeling of deep happiness and delight."
    },
    {
      "word": "bee",
      "hint": "A striped buzzing insect that makes sweet honey."
    },
    {
      "word": "ant",
      "hint": "A tiny hardworking insect that lives in colonies."
    },
    {
      "word": "ape",
      "hint": "A smart primate like a chimpanzee."
    },
    {
      "word": "elk",
      "hint": "A large deer with majestic antlers in the forest."
    },
    {
      "word": "yak",
      "hint": "A shaggy, long-haired ox living in high mountains."
    },
    {
      "word": "sea",
      "hint": "A vast expanse of blue saltwater."
    },
    {
      "word": "ice",
      "hint": "Frozen water that is cold and slippery."
    },
    {
      "word": "tea",
      "hint": "A soothing warm beverage brewed with fragrant herbs or leaves."
    },
    {
      "word": "pie",
      "hint": "A baked pastry filled with sweet apples or cherries."
    },
    {
      "word": "oak",
      "hint": "A giant sturdy tree that grows acorns."
    },
    {
      "word": "elm",
      "hint": "A tall shade tree with graceful green branches."
    },
    {
      "word": "fir",
      "hint": "An evergreen pine tree that stays green all year."
    },
    {
      "word": "ray",
      "hint": "A single straight beam of warm sunlight."
    },
    {
      "word": "bay",
      "hint": "A curved body of calm ocean water along a coast."
    },
    {
      "word": "hay",
      "hint": "Dried sweet grass fed to horses on a farm."
    },
    {
      "word": "way",
      "hint": "A trail or direction to travel along."
    },
    {
      "word": "may",
      "hint": "The cheerful spring month after April."
    },
    {
      "word": "say",
      "hint": "To speak words aloud with your voice."
    },
    {
      "word": "pay",
      "hint": "To give coins or dollars when buying goods."
    },
    {
      "word": "lay",
      "hint": "To put down gently on a table or pillow."
    },
    {
      "word": "zoo",
      "hint": "A park where people can view fascinating animals."
    },
    {
      "word": "fur",
      "hint": "The soft warm coat of hair on a cat or bear."
    },
    {
      "word": "car",
      "hint": "A four-wheeled passenger automobile."
    },
    {
      "word": "jar",
      "hint": "A clear glass container with a screw-on lid."
    },
    {
      "word": "tar",
      "hint": "Dark sticky material used when paving smooth roads."
    },
    {
      "word": "bar",
      "hint": "A solid piece of chocolate or a gymnastics rail."
    },
    {
      "word": "far",
      "hint": "A long distance away; not nearby."
    },
    {
      "word": "raw",
      "hint": "Fresh uncooked vegetables like crisp carrots."
    },
    {
      "word": "paw",
      "hint": "The soft padded foot of a puppy or kitten."
    },
    {
      "word": "jaw",
      "hint": "The bone of the mouth that holds your teeth."
    },
    {
      "word": "saw",
      "hint": "A tool with teeth for cutting wood, or viewed in past."
    },
    {
      "word": "law",
      "hint": "A rule created to keep communities fair and safe."
    },
    {
      "word": "low",
      "hint": "Close to the floor or ground; not high."
    },
    {
      "word": "key",
      "hint": "A small metal tool used to unlock a door."
    },
    {
      "word": "eye",
      "hint": "The organ of vision that lets you see."
    },
    {
      "word": "toe",
      "hint": "One of the five digits at the end of each foot."
    },
    {
      "word": "arm",
      "hint": "The upper body limb connecting shoulder to hand."
    },
    {
      "word": "ear",
      "hint": "The sensory organ used for hearing sounds."
    },
    {
      "word": "art",
      "hint": "Drawings, paintings, and sculptures made with creativity."
    },
    {
      "word": "oar",
      "hint": "A wooden paddle used to row a small boat."
    },
    {
      "word": "air",
      "hint": "The invisible mixture of gases we breathe."
    }
  ],
  "2": [
    {
      "word": "blow",
      "hint": "To send a stream of air from your mouth."
    },
    {
      "word": "blue",
      "hint": "The beautiful color of the clear sky and oceans."
    },
    {
      "word": "blot",
      "hint": "A spot or stain of ink on paper."
    },
    {
      "word": "blob",
      "hint": "A soft, round drop of paint or dough."
    },
    {
      "word": "blur",
      "hint": "Something that is not clear to see."
    },
    {
      "word": "clam",
      "hint": "A sea creature living inside a two-hinged shell."
    },
    {
      "word": "clap",
      "hint": "To strike your hands together to show approval."
    },
    {
      "word": "clay",
      "hint": "Soft moldable earth used for making pottery."
    },
    {
      "word": "clip",
      "hint": "A small fastener that holds papers together."
    },
    {
      "word": "clog",
      "hint": "A wooden shoe or when a drain gets blocked."
    },
    {
      "word": "club",
      "hint": "A group of friends who share a fun hobby."
    },
    {
      "word": "flap",
      "hint": "To move wings up and down to fly."
    },
    {
      "word": "flat",
      "hint": "Smooth and level without bumps."
    },
    {
      "word": "flag",
      "hint": "A piece of cloth with symbols waving in the wind."
    },
    {
      "word": "flee",
      "hint": "To run away quickly from danger."
    },
    {
      "word": "flip",
      "hint": "To turn something over, like a pancake."
    },
    {
      "word": "flow",
      "hint": "To move steadily along like a stream of water."
    },
    {
      "word": "glad",
      "hint": "Feeling happy, pleased, and cheerful."
    },
    {
      "word": "glen",
      "hint": "A narrow, peaceful secluded valley."
    },
    {
      "word": "glow",
      "hint": "To shine with a steady, gentle light."
    },
    {
      "word": "plug",
      "hint": "An electrical connector or a stopper for a bathtub."
    },
    {
      "word": "plum",
      "hint": "A sweet purple or red fruit with smooth skin."
    },
    {
      "word": "plus",
      "hint": "The mathematical addition sign (+)."
    },
    {
      "word": "plot",
      "hint": "The storyline of a book or a garden patch."
    },
    {
      "word": "play",
      "hint": "To have fun engaging in games with friends."
    },
    {
      "word": "plan",
      "hint": "An organized idea worked out before taking action."
    },
    {
      "word": "slam",
      "hint": "To close a door loudly with force."
    },
    {
      "word": "slap",
      "hint": "A quick tap with the open palm of a hand."
    },
    {
      "word": "sled",
      "hint": "A vehicle that glides over snow on winter hills."
    },
    {
      "word": "slid",
      "hint": "Glided smoothly across slippery ice in the past."
    },
    {
      "word": "slim",
      "hint": "Slender, thin, and graceful."
    },
    {
      "word": "slip",
      "hint": "To slide accidentally on a wet surface."
    },
    {
      "word": "slot",
      "hint": "A narrow opening, like where a coin is dropped."
    },
    {
      "word": "slug",
      "hint": "A slow-moving garden creature like a snail without a shell."
    },
    {
      "word": "brag",
      "hint": "To boast with pride about yourself."
    },
    {
      "word": "bran",
      "hint": "Healthy outer cereal flakes of grain."
    },
    {
      "word": "brim",
      "hint": "The top edge of a cup or hat."
    },
    {
      "word": "crab",
      "hint": "A sea creature with ten legs and strong claws."
    },
    {
      "word": "crop",
      "hint": "Plants like wheat or corn grown by farmers."
    },
    {
      "word": "cram",
      "hint": "To pack lots of things tightly into a backpack."
    },
    {
      "word": "drip",
      "hint": "Water falling in tiny individual drops."
    },
    {
      "word": "drop",
      "hint": "A small bead of rain or to let something fall."
    },
    {
      "word": "drum",
      "hint": "A musical instrument played by beating with sticks."
    },
    {
      "word": "frog",
      "hint": "A green amphibian that hops and catches flies."
    },
    {
      "word": "fret",
      "hint": "To worry needlessly about small things."
    },
    {
      "word": "from",
      "hint": "Indicating the starting point or sender of a gift."
    },
    {
      "word": "free",
      "hint": "Not held back; also costing zero dollars."
    },
    {
      "word": "grab",
      "hint": "To take hold of something quickly with your hand."
    },
    {
      "word": "gram",
      "hint": "A metric unit used for measuring light weight."
    },
    {
      "word": "grid",
      "hint": "A pattern of criss-crossing horizontal and vertical lines."
    },
    {
      "word": "grim",
      "hint": "Serious and stern in expression."
    },
    {
      "word": "grin",
      "hint": "A big, joyful, beaming smile."
    },
    {
      "word": "grip",
      "hint": "To hold on tightly with your fingers."
    },
    {
      "word": "grit",
      "hint": "Courage and determination to keep trying."
    },
    {
      "word": "prep",
      "hint": "To get ready beforehand for an activity."
    },
    {
      "word": "prod",
      "hint": "To poke or encourage gently."
    },
    {
      "word": "prop",
      "hint": "An object used on stage by actors in a play."
    },
    {
      "word": "tram",
      "hint": "An electric rail car running along city streets."
    },
    {
      "word": "trap",
      "hint": "A device made to catch things."
    },
    {
      "word": "tree",
      "hint": "A tall wooden plant with branches and leaves."
    },
    {
      "word": "trek",
      "hint": "A long, rewarding hike through the wilderness."
    },
    {
      "word": "trim",
      "hint": "To clip neatly with scissors."
    },
    {
      "word": "trip",
      "hint": "A fun journey or vacation to visit new places."
    },
    {
      "word": "trot",
      "hint": "A gentle bouncing run by a friendly pony."
    },
    {
      "word": "scan",
      "hint": "To look over quickly or digitize a document."
    },
    {
      "word": "scab",
      "hint": "A protective crust that forms over a healed scrape."
    },
    {
      "word": "skid",
      "hint": "To slide sideways on a slick road."
    },
    {
      "word": "skim",
      "hint": "To remove cream from milk or read through quickly."
    },
    {
      "word": "skin",
      "hint": "The outer protective layer covering your body."
    },
    {
      "word": "skip",
      "hint": "To hop lightly along alternating feet."
    },
    {
      "word": "skit",
      "hint": "A short, funny comedic theatrical play."
    },
    {
      "word": "smog",
      "hint": "Hazy fog mixed with air particles."
    },
    {
      "word": "snap",
      "hint": "To make a clicking sound with your fingers."
    },
    {
      "word": "snip",
      "hint": "To cut with quick small scissor clips."
    },
    {
      "word": "snug",
      "hint": "Warm, cozy, and comfortably fitted."
    },
    {
      "word": "span",
      "hint": "The full length from one end to another."
    },
    {
      "word": "spat",
      "hint": "A tiny brief disagreement between friends."
    },
    {
      "word": "spin",
      "hint": "To rotate round and round rapidly."
    },
    {
      "word": "spit",
      "hint": "To eject water from the mouth after brushing teeth."
    },
    {
      "word": "spot",
      "hint": "A round dot, or a favorite location in a park."
    },
    {
      "word": "spun",
      "hint": "Twisted threads together into yarn in the past."
    },
    {
      "word": "step",
      "hint": "To lift a foot and place it forward to walk."
    },
    {
      "word": "stem",
      "hint": "The main stalk supporting a green flower."
    },
    {
      "word": "stop",
      "hint": "To come to a complete halt."
    },
    {
      "word": "stub",
      "hint": "A short leftover piece of a pencil or ticket."
    },
    {
      "word": "swim",
      "hint": "To paddle and move smoothly through water."
    },
    {
      "word": "swan",
      "hint": "A graceful white waterbird with a long neck."
    },
    {
      "word": "sway",
      "hint": "To swing gently back and forth like tree branches."
    },
    {
      "word": "band",
      "hint": "A musical group of musicians playing instruments."
    },
    {
      "word": "hand",
      "hint": "The part of your body with five fingers."
    },
    {
      "word": "land",
      "hint": "Solid ground rather than ocean water."
    },
    {
      "word": "sand",
      "hint": "Fine grains of crushed rock found on beaches."
    },
    {
      "word": "pond",
      "hint": "A small body of calm freshwater."
    },
    {
      "word": "wind",
      "hint": "Blowing outdoor air that flies kites and rustles tree leaves."
    },
    {
      "word": "fend",
      "hint": "To protect, ward off danger, or provide for yourself."
    },
    {
      "word": "lend",
      "hint": "To let a friend borrow a book."
    },
    {
      "word": "mend",
      "hint": "To sew and repair a tear in a favorite shirt."
    },
    {
      "word": "send",
      "hint": "To mail a postcard or message to someone."
    },
    {
      "word": "bond",
      "hint": "A strong connection of friendship between people."
    },
    {
      "word": "fond",
      "hint": "Having affection or warm liking for something."
    },
    {
      "word": "bank",
      "hint": "A safe place where money is saved and kept."
    },
    {
      "word": "pink",
      "hint": "A delicate color made by mixing red and white."
    },
    {
      "word": "sink",
      "hint": "A basin with running water for washing hands."
    },
    {
      "word": "wink",
      "hint": "To quickly close and open one eye as a friendly sign."
    },
    {
      "word": "tank",
      "hint": "A glass aquarium where goldfish swim happily."
    },
    {
      "word": "link",
      "hint": "A single loop in a chain or a website address."
    },
    {
      "word": "rank",
      "hint": "A level or grade in scouts or martial arts."
    },
    {
      "word": "bunk",
      "hint": "Stacked twin beds used in cozy cabins."
    },
    {
      "word": "dunk",
      "hint": "To dip a warm cookie into a glass of milk."
    },
    {
      "word": "tent",
      "hint": "A portable fabric shelter used when camping."
    },
    {
      "word": "hunt",
      "hint": "To search carefully for hidden items, like treasure."
    },
    {
      "word": "vent",
      "hint": "An opening that allows fresh air to circulate."
    },
    {
      "word": "sent",
      "hint": "Delivered a letter in the mail in the past."
    },
    {
      "word": "rent",
      "hint": "To pay to use a bicycle or cabin for a week."
    },
    {
      "word": "bent",
      "hint": "Curved out of a straight line."
    },
    {
      "word": "dent",
      "hint": "A small hollow mark pressed into a metal surface."
    },
    {
      "word": "hint",
      "hint": "A helpful clue that leads you to an answer."
    },
    {
      "word": "lint",
      "hint": "Tiny fuzzy fibers gathered on clothing."
    },
    {
      "word": "mint",
      "hint": "A fresh green herb with a cool, pleasant flavor."
    },
    {
      "word": "pint",
      "hint": "A unit of liquid measurement equal to two cups."
    },
    {
      "word": "pant",
      "hint": "To breathe fast after a fun race."
    },
    {
      "word": "camp",
      "hint": "To stay outdoors in nature overnight."
    },
    {
      "word": "lamp",
      "hint": "A tabletop device providing electric reading light."
    },
    {
      "word": "jump",
      "hint": "To push off the ground into the air."
    },
    {
      "word": "pump",
      "hint": "A device used to inflate bicycle tires."
    },
    {
      "word": "bump",
      "hint": "A small raised spot on a smooth road."
    },
    {
      "word": "lump",
      "hint": "A compact chunk of clay or sugar."
    },
    {
      "word": "ramp",
      "hint": "A slanted pathway useful for rolling wheels."
    },
    {
      "word": "damp",
      "hint": "Slightly wet or moist; not fully dry."
    },
    {
      "word": "melt",
      "hint": "To turn from solid ice into liquid with warmth."
    },
    {
      "word": "belt",
      "hint": "A strap worn around the waist to hold pants up."
    },
    {
      "word": "felt",
      "hint": "A soft colorful craft fabric, or touched in past."
    },
    {
      "word": "colt",
      "hint": "A spirited young male horse."
    },
    {
      "word": "bolt",
      "hint": "A threaded metal pin secured with a nut."
    },
    {
      "word": "jolt",
      "hint": "A sudden brief bump or surge of surprise."
    },
    {
      "word": "nest",
      "hint": "A cozy home woven by birds from twigs."
    },
    {
      "word": "vest",
      "hint": "A sleeveless garment worn over a shirt."
    },
    {
      "word": "fast",
      "hint": "Moving at high speed; swift."
    },
    {
      "word": "best",
      "hint": "Of the highest possible excellence and quality."
    },
    {
      "word": "rest",
      "hint": "To relax quietly and regain energy."
    },
    {
      "word": "rust",
      "hint": "Reddish coating formed on iron exposed to rain."
    },
    {
      "word": "dust",
      "hint": "Fine dry powder particles settled on shelves."
    },
    {
      "word": "past",
      "hint": "Time that has already happened before today."
    },
    {
      "word": "cast",
      "hint": "A plaster wrap that protects a healing bone."
    },
    {
      "word": "cost",
      "hint": "The price required to buy a book or toy."
    },
    {
      "word": "lost",
      "hint": "Unable to be found; not knowing your location."
    },
    {
      "word": "post",
      "hint": "A wooden stake in the ground, or to mail a letter."
    },
    {
      "word": "test",
      "hint": "A quiz or check to see how much you know."
    },
    {
      "word": "west",
      "hint": "The compass direction where the sun sets."
    },
    {
      "word": "list",
      "hint": "A series of items written down on paper."
    },
    {
      "word": "mist",
      "hint": "A fine spray of tiny water droplets in the air."
    },
    {
      "word": "soft",
      "hint": "Pleasantly smooth and gentle to touch."
    },
    {
      "word": "loft",
      "hint": "An upper open room located under a roof."
    },
    {
      "word": "raft",
      "hint": "A flat floating platform used on lakes."
    },
    {
      "word": "gift",
      "hint": "A wrapped present given to make someone happy."
    },
    {
      "word": "lift",
      "hint": "To raise something up into the air."
    },
    {
      "word": "sift",
      "hint": "To pass flour through a fine wire mesh screen."
    },
    {
      "word": "left",
      "hint": "The opposite direction of right."
    },
    {
      "word": "fact",
      "hint": "A piece of information that is proven true."
    },
    {
      "word": "duct",
      "hint": "A tube or pipe carrying warm air through rooms."
    },
    {
      "word": "pact",
      "hint": "A formal promise or agreement between friends."
    },
    {
      "word": "duck",
      "hint": "A waterbird with webbed feet and a yellow bill."
    },
    {
      "word": "rock",
      "hint": "A solid mass of minerals found in nature."
    },
    {
      "word": "lock",
      "hint": "A mechanism secured with a brass key."
    },
    {
      "word": "sock",
      "hint": "A soft garment worn on your foot inside shoes."
    },
    {
      "word": "neck",
      "hint": "The part of the body connecting head to shoulders."
    },
    {
      "word": "peck",
      "hint": "A quick tap with a bird beak."
    },
    {
      "word": "deck",
      "hint": "An outdoor wooden patio attached to a house."
    },
    {
      "word": "back",
      "hint": "The rear part of your body opposite the chest."
    },
    {
      "word": "pack",
      "hint": "To put clothes neatly inside a suitcase."
    },
    {
      "word": "rack",
      "hint": "A metal stand for holding coats or spices."
    },
    {
      "word": "sack",
      "hint": "A large sturdy bag made of burlap or canvas."
    },
    {
      "word": "tack",
      "hint": "A short small nail with a broad flat head."
    },
    {
      "word": "kick",
      "hint": "To strike a soccer ball with your foot."
    },
    {
      "word": "pick",
      "hint": "To choose a favorite flower from a meadow."
    },
    {
      "word": "tick",
      "hint": "The soft rhythmic sound made by a clock."
    },
    {
      "word": "bake",
      "hint": "To cook delicious muffins in a warm oven."
    },
    {
      "word": "cake",
      "hint": "A sweet dessert served at birthday celebrations."
    },
    {
      "word": "make",
      "hint": "To create, build, or construct something new."
    },
    {
      "word": "lake",
      "hint": "A large calm body of freshwater surrounded by land."
    },
    {
      "word": "take",
      "hint": "To grasp and carry something with you."
    },
    {
      "word": "wake",
      "hint": "To stop sleeping and start a brand new day."
    },
    {
      "word": "rake",
      "hint": "A long-handled garden tool used to gather autumn leaves."
    },
    {
      "word": "bike",
      "hint": "A two-wheeled vehicle steered with handlebars."
    },
    {
      "word": "hike",
      "hint": "A long scenic walk along mountain trails."
    },
    {
      "word": "like",
      "hint": "To enjoy or appreciate something."
    },
    {
      "word": "kite",
      "hint": "A light cloth craft flown high up in the wind."
    },
    {
      "word": "bite",
      "hint": "To cut food with your teeth."
    },
    {
      "word": "site",
      "hint": "A location where a building or campfire is placed."
    },
    {
      "word": "ride",
      "hint": "To sit on a bicycle or carousel horse and travel."
    },
    {
      "word": "side",
      "hint": "An edge or border of a geometric shape."
    },
    {
      "word": "tide",
      "hint": "The rise and fall of ocean water twice daily."
    },
    {
      "word": "wide",
      "hint": "Spanning a large distance across; not narrow."
    },
    {
      "word": "hide",
      "hint": "To stay out of sight in a secret spot."
    },
    {
      "word": "line",
      "hint": "A straight stroke drawn on a piece of paper."
    },
    {
      "word": "mine",
      "hint": "Belonging to me, or an underground quarry."
    },
    {
      "word": "nine",
      "hint": "The number between eight and ten (9)."
    },
    {
      "word": "pine",
      "hint": "An evergreen forest tree with fragrant needles and woody cones."
    },
    {
      "word": "vine",
      "hint": "A climbing woody plant that produces juicy grapes."
    },
    {
      "word": "fine",
      "hint": "Very good, healthy, or made of delicate threads."
    },
    {
      "word": "home",
      "hint": "The cozy house where you live with family."
    },
    {
      "word": "bone",
      "hint": "Hard white structure that forms the skeleton."
    },
    {
      "word": "cone",
      "hint": "A solid 3D shape that tapers smoothly from a round base to a point."
    },
    {
      "word": "tone",
      "hint": "The musical pitch or quality of a sound."
    },
    {
      "word": "zone",
      "hint": "A designated area or region with special rules or boundaries."
    },
    {
      "word": "rope",
      "hint": "Strong thick braided cord used for climbing."
    },
    {
      "word": "hope",
      "hint": "A cheerful feeling of expecting good things."
    },
    {
      "word": "rose",
      "hint": "A beautiful sweet-scented garden flower with thorns."
    },
    {
      "word": "nose",
      "hint": "The facial organ used for breathing and smelling."
    },
    {
      "word": "hose",
      "hint": "A flexible rubber tube for watering gardens."
    },
    {
      "word": "pose",
      "hint": "To stand still in a position for a photograph."
    },
    {
      "word": "hole",
      "hint": "An opening or hollow spot in the ground."
    },
    {
      "word": "mole",
      "hint": "A furry little animal that digs underground tunnels."
    },
    {
      "word": "pole",
      "hint": "A long, slender rounded post used to hoist a flag or support a tent."
    },
    {
      "word": "sole",
      "hint": "The bottom underside of your shoe or foot."
    },
    {
      "word": "tube",
      "hint": "A hollow, long cylinder made of plastic, glass, or cardboard."
    },
    {
      "word": "mule",
      "hint": "A hardworking farm animal with long ears."
    },
    {
      "word": "cube",
      "hint": "A 3D box shape with six identical square sides."
    },
    {
      "word": "cute",
      "hint": "Sweet, charming, and delightful to see."
    },
    {
      "word": "mute",
      "hint": "Silent; having the sound turned off."
    },
    {
      "word": "fuse",
      "hint": "A safety device that protects electrical circuits."
    },
    {
      "word": "dune",
      "hint": "A hill of wind-blown golden sand in a desert."
    },
    {
      "word": "tune",
      "hint": "A catchy melody composed of musical notes."
    },
    {
      "word": "rule",
      "hint": "A guideline designed to keep everyone safe."
    },
    {
      "word": "bell",
      "hint": "A hollow metal chime that rings when struck."
    },
    {
      "word": "ball",
      "hint": "A round bouncy sphere used in soccer and tennis."
    },
    {
      "word": "call",
      "hint": "To speak loudly to get someone attention."
    },
    {
      "word": "fall",
      "hint": "The autumn season when leaves turn orange."
    },
    {
      "word": "tall",
      "hint": "Reaching high above average height."
    },
    {
      "word": "wall",
      "hint": "A vertical brick or wooden side of a room."
    },
    {
      "word": "hall",
      "hint": "A long corridor inside a school or house."
    },
    {
      "word": "mall",
      "hint": "A large indoor shopping center with many stores."
    },
    {
      "word": "fill",
      "hint": "To pour water into a glass until it is full."
    },
    {
      "word": "hill",
      "hint": "A raised mound of green land smaller than a mountain."
    },
    {
      "word": "mill",
      "hint": "A building where grain is ground into flour."
    },
    {
      "word": "pill",
      "hint": "Medicine shaped in a small solid tablet."
    },
    {
      "word": "will",
      "hint": "Determination and intention to succeed."
    },
    {
      "word": "doll",
      "hint": "A toy figure shaped like a human child."
    },
    {
      "word": "roll",
      "hint": "To move forward by turning over and over."
    },
    {
      "word": "toll",
      "hint": "A small fee paid to drive across a scenic bridge."
    },
    {
      "word": "bull",
      "hint": "A strong male bovine on a farm."
    },
    {
      "word": "full",
      "hint": "Holding as much as possible; not empty."
    },
    {
      "word": "pull",
      "hint": "To exert force on an object to draw it closer."
    },
    {
      "word": "puff",
      "hint": "A short light breath or cloud of steam."
    },
    {
      "word": "cuff",
      "hint": "The folded fabric band at the bottom of a sleeve."
    },
    {
      "word": "mess",
      "hint": "An untidy state of toys on the floor needing cleanup."
    },
    {
      "word": "less",
      "hint": "A smaller amount or quantity."
    },
    {
      "word": "kiss",
      "hint": "A gentle sign of affection on a cheek."
    },
    {
      "word": "miss",
      "hint": "To fail to catch a ball, or to think fondly of someone."
    },
    {
      "word": "pass",
      "hint": "To throw a basketball to a teammate."
    },
    {
      "word": "bird",
      "hint": "A feathered creature that sings in tree branches."
    },
    {
      "word": "moon",
      "hint": "The glowing orb illuminating the night sky."
    },
    {
      "word": "star",
      "hint": "A twinkling point of celestial light in outer space."
    },
    {
      "word": "book",
      "hint": "Bound pages containing stories and illustrations."
    },
    {
      "word": "fish",
      "hint": "A water-dwelling creature with gills and shiny scales."
    },
    {
      "word": "cave",
      "hint": "A natural hollow rock chamber inside a mountain."
    },
    {
      "word": "wave",
      "hint": "A ridge of water rolling onto a sandy beach."
    },
    {
      "word": "gate",
      "hint": "A swinging wooden or iron barrier in a fence."
    },
    {
      "word": "late",
      "hint": "Arriving after the scheduled start time."
    },
    {
      "word": "maze",
      "hint": "A puzzle of branching twisting pathways to solve."
    },
    {
      "word": "gaze",
      "hint": "To look steadily and admiringly at the stars."
    },
    {
      "word": "page",
      "hint": "One leaf of paper in a reading book."
    },
    {
      "word": "cage",
      "hint": "A secure enclosure for pet birds to perch safely."
    },
    {
      "word": "sage",
      "hint": "A wise person or a fragrant garden cooking herb."
    },
    {
      "word": "time",
      "hint": "Measured in seconds, minutes, hours, and days."
    },
    {
      "word": "lime",
      "hint": "A sour, juicy green citrus fruit."
    },
    {
      "word": "rice",
      "hint": "Small white grains cooked and served in bowls."
    },
    {
      "word": "mice",
      "hint": "Plural of mouse; small friendly rodents."
    },
    {
      "word": "nice",
      "hint": "Kind, pleasant, and thoughtful toward others."
    },
    {
      "word": "dice",
      "hint": "Numbered wooden cubes rolled in board games."
    },
    {
      "word": "face",
      "hint": "The front of your head with eyes, nose, and mouth."
    },
    {
      "word": "race",
      "hint": "A friendly running contest to see who is fastest."
    },
    {
      "word": "pace",
      "hint": "The steady speed at which you walk or jog."
    },
    {
      "word": "lace",
      "hint": "Delicate openwork patterned fabric on dresses."
    },
    {
      "word": "cape",
      "hint": "A flowing superhero garment fastened at the neck."
    },
    {
      "word": "tape",
      "hint": "A sticky adhesive strip used for wrapping gifts."
    },
    {
      "word": "vane",
      "hint": "A spinning rooster weather tool showing wind direction."
    },
    {
      "word": "lane",
      "hint": "A quiet narrow country road."
    },
    {
      "word": "mane",
      "hint": "Long thick hair growing around a lion neck."
    },
    {
      "word": "cane",
      "hint": "A walking stick made of smooth wood."
    },
    {
      "word": "pale",
      "hint": "Light in color, like a pastel watercolor painting."
    },
    {
      "word": "tale",
      "hint": "A bedtime fairy story told with imagination."
    },
    {
      "word": "sale",
      "hint": "When store items are offered at discount prices."
    },
    {
      "word": "sail",
      "hint": "A canvas sheet that catches wind to propel a boat."
    },
    {
      "word": "mail",
      "hint": "Letters, postcards, and parcels delivered by a postal carrier."
    },
    {
      "word": "tail",
      "hint": "The hindmost part of an animal body."
    },
    {
      "word": "rail",
      "hint": "A steel track that locomotives roll along smoothly."
    },
    {
      "word": "rain",
      "hint": "Water droplets falling from sky clouds."
    },
    {
      "word": "gain",
      "hint": "To increase or acquire a new skill."
    },
    {
      "word": "main",
      "hint": "The primary, chief, or most important part."
    },
    {
      "word": "pain",
      "hint": "An unpleasant physical feeling from a scrape."
    },
    {
      "word": "coin",
      "hint": "A round piece of metal money like a quarter or nickel."
    },
    {
      "word": "soil",
      "hint": "Rich dark earth where garden seeds sprout."
    },
    {
      "word": "boil",
      "hint": "When water bubbles rapidly at high heat in a kettle."
    },
    {
      "word": "foil",
      "hint": "Shiny aluminum wrapping used in kitchen baking."
    },
    {
      "word": "join",
      "hint": "To connect together or become part of a group."
    },
    {
      "word": "toad",
      "hint": "A bumpy-skinned amphibian that lives in gardens."
    },
    {
      "word": "road",
      "hint": "A wide paved way for bicycles and cars."
    },
    {
      "word": "coat",
      "hint": "A warm winter jacket with buttons and pockets."
    },
    {
      "word": "boat",
      "hint": "A vessel that floats and travels across lakes."
    },
    {
      "word": "goat",
      "hint": "A sure-footed horned animal with a chin beard."
    },
    {
      "word": "soap",
      "hint": "A bubbly lathering bar used for washing hands clean."
    }
  ],
  "3": [
    {
      "word": "beach",
      "hint": "A sandy ocean shore where gentle waves roll in."
    },
    {
      "word": "chair",
      "hint": "A comfortable seat with four legs and a back."
    },
    {
      "word": "charm",
      "hint": "A pleasant quality, or a tiny ornament on a bracelet."
    },
    {
      "word": "chase",
      "hint": "To run after a friend in a game of playground tag."
    },
    {
      "word": "check",
      "hint": "To inspect carefully to ensure everything is correct."
    },
    {
      "word": "cheek",
      "hint": "Either side of your face below your eye."
    },
    {
      "word": "cheer",
      "hint": "To shout encouragement and joy for teammates."
    },
    {
      "word": "chess",
      "hint": "A strategic board game played with kings and queens."
    },
    {
      "word": "chest",
      "hint": "The front of your torso, or a wooden treasure trunk."
    },
    {
      "word": "chick",
      "hint": "A fluffy yellow baby bird that recently hatched from an egg."
    },
    {
      "word": "chief",
      "hint": "A respected leader of a group or fire department."
    },
    {
      "word": "child",
      "hint": "A young human growing up."
    },
    {
      "word": "chili",
      "hint": "A spicy warm bean soup or small hot pepper."
    },
    {
      "word": "chill",
      "hint": "A pleasant coolness in the autumn air."
    },
    {
      "word": "chime",
      "hint": "The melodious bell sound made by a grandfather clock."
    },
    {
      "word": "chirp",
      "hint": "The short, happy high-pitched sound of a songbird."
    },
    {
      "word": "chive",
      "hint": "A green onion-like garden herb chopped into salads."
    },
    {
      "word": "chore",
      "hint": "A small helpful household task like making your bed."
    },
    {
      "word": "chunk",
      "hint": "A thick, solid piece of cheese or melon."
    },
    {
      "word": "shade",
      "hint": "A cool shelter out of the direct hot sunlight."
    },
    {
      "word": "shake",
      "hint": "To vibrate or move back and forth rapidly with quick motions."
    },
    {
      "word": "shape",
      "hint": "The geometric outline of an object, like a circle or star."
    },
    {
      "word": "share",
      "hint": "To give a portion of your crayons or snacks to a friend."
    },
    {
      "word": "shark",
      "hint": "A swift ocean predator with a dorsal fin."
    },
    {
      "word": "sharp",
      "hint": "Having a thin edge that cuts cleanly, like scissors."
    },
    {
      "word": "shave",
      "hint": "To trim thin slices of ice for a snow cone."
    },
    {
      "word": "shawl",
      "hint": "A warm woolen wrap draped over shoulders."
    },
    {
      "word": "sheep",
      "hint": "A gentle woolly farm animal that grazes in pastures."
    },
    {
      "word": "sheet",
      "hint": "A piece of paper or a cotton bed covering."
    },
    {
      "word": "shelf",
      "hint": "A flat wooden board attached to a wall holding books."
    },
    {
      "word": "shell",
      "hint": "The hard protective outer covering of a sea turtle."
    },
    {
      "word": "shine",
      "hint": "To give off bright, radiant light."
    },
    {
      "word": "shiny",
      "hint": "Reflecting bright light; polished and gleaming."
    },
    {
      "word": "shirt",
      "hint": "A garment with buttons worn on the upper body."
    },
    {
      "word": "shock",
      "hint": "A sudden pleasant surprise, or static from a carpet."
    },
    {
      "word": "shoot",
      "hint": "To aim a basketball toward the hoop."
    },
    {
      "word": "shore",
      "hint": "The land along the edge of an ocean or lake."
    },
    {
      "word": "short",
      "hint": "Not long in distance or duration; also not tall."
    },
    {
      "word": "shout",
      "hint": "To call out loudly across a playground."
    },
    {
      "word": "shove",
      "hint": "To push something heavy forward across the floor."
    },
    {
      "word": "shown",
      "hint": "Displayed clearly for people to see."
    },
    {
      "word": "shrub",
      "hint": "A low woody bush growing in a garden."
    },
    {
      "word": "shrug",
      "hint": "To raise your shoulders to say I do not know."
    },
    {
      "word": "thank",
      "hint": "To express gratitude for a kind gift or favor."
    },
    {
      "word": "thief",
      "hint": "A sneaky person who takes what belongs to others."
    },
    {
      "word": "thigh",
      "hint": "The upper part of the human leg above the knee."
    },
    {
      "word": "thing",
      "hint": "An object or item."
    },
    {
      "word": "think",
      "hint": "To use your brain to solve problems and imagine."
    },
    {
      "word": "third",
      "hint": "Coming right after second in an orderly line."
    },
    {
      "word": "thorn",
      "hint": "A sharp point on the stem of a rose bush."
    },
    {
      "word": "those",
      "hint": "Referring to specific objects that are further away."
    },
    {
      "word": "three",
      "hint": "The number between two and four (3)."
    },
    {
      "word": "throw",
      "hint": "To toss a baseball through the air to a catcher."
    },
    {
      "word": "thumb",
      "hint": "The short, sturdy first digit on your hand."
    },
    {
      "word": "thump",
      "hint": "A dull, heavy sound like a watermelon hitting a table."
    },
    {
      "word": "whale",
      "hint": "A magnificent giant ocean mammal with a blowhole."
    },
    {
      "word": "wheat",
      "hint": "A golden cereal grain ground into flour for bread."
    },
    {
      "word": "wheel",
      "hint": "A circular frame that spins around an axle on cars."
    },
    {
      "word": "where",
      "hint": "In what location or place."
    },
    {
      "word": "which",
      "hint": "Asking to choose between two or more items."
    },
    {
      "word": "while",
      "hint": "During the same period of time that something occurs."
    },
    {
      "word": "whirl",
      "hint": "To spin round and round rapidly like a pinwheel."
    },
    {
      "word": "whisk",
      "hint": "A wire kitchen utensil used to beat eggs frothy."
    },
    {
      "word": "white",
      "hint": "The clean, bright color of freshly fallen snow."
    },
    {
      "word": "graph",
      "hint": "A visual diagram comparing mathematical data."
    },
    {
      "word": "photo",
      "hint": "A snapshot picture taken with a camera."
    },
    {
      "word": "phone",
      "hint": "A device used to talk with family across distances."
    },
    {
      "word": "phase",
      "hint": "A distinct stage or step in a recurring developmental cycle."
    },
    {
      "word": "quail",
      "hint": "A small round game bird with a feather plume on its head."
    },
    {
      "word": "quake",
      "hint": "To shake or tremble gently."
    },
    {
      "word": "queen",
      "hint": "A royal monarch who wears a sparkling crown."
    },
    {
      "word": "quest",
      "hint": "An adventurous journey to find a great treasure."
    },
    {
      "word": "quick",
      "hint": "Fast and speedy in movement."
    },
    {
      "word": "quiet",
      "hint": "Making very little sound; peaceful and calm."
    },
    {
      "word": "quilt",
      "hint": "A cozy patchwork blanket stitched from soft fabrics."
    },
    {
      "word": "quirk",
      "hint": "A charming, unique personality trait."
    },
    {
      "word": "quota",
      "hint": "A target goal or share assigned to a group."
    },
    {
      "word": "quote",
      "hint": "To repeat the exact words spoken by an author."
    },
    {
      "word": "brain",
      "hint": "The organ inside your head that thinks and dreams."
    },
    {
      "word": "chain",
      "hint": "Connected metal rings used to secure a bicycle."
    },
    {
      "word": "drain",
      "hint": "A pipe that carries water away from a sink."
    },
    {
      "word": "faint",
      "hint": "Very soft or dim; not strong or loud."
    },
    {
      "word": "grain",
      "hint": "Tiny seeds of crops like rice, wheat, and oats."
    },
    {
      "word": "paint",
      "hint": "Colorful liquid brushed onto paper to make art."
    },
    {
      "word": "plain",
      "hint": "Simple and without extra decorations, or an open field."
    },
    {
      "word": "raise",
      "hint": "To lift your hand in class to ask a question."
    },
    {
      "word": "snail",
      "hint": "A slow garden creature with a spiraled shell."
    },
    {
      "word": "stain",
      "hint": "A spot of spilled berry juice on a cloth."
    },
    {
      "word": "train",
      "hint": "A series of railway cars traveling on steel tracks."
    },
    {
      "word": "trait",
      "hint": "A distinguishing quality or feature of a person."
    },
    {
      "word": "delay",
      "hint": "A pause or wait before an event begins."
    },
    {
      "word": "essay",
      "hint": "A short piece of writing exploring an interesting topic."
    },
    {
      "word": "spray",
      "hint": "A fine mist of water squirted from a bottle."
    },
    {
      "word": "stray",
      "hint": "To wander off a path, or a wandering pet."
    },
    {
      "word": "bleed",
      "hint": "When a small scrape produces a tiny red drop."
    },
    {
      "word": "breed",
      "hint": "A specific variety of pet, like a golden retriever."
    },
    {
      "word": "creek",
      "hint": "A small, babbling stream of clear freshwater."
    },
    {
      "word": "creep",
      "hint": "To move slowly and quietly on tiptoes."
    },
    {
      "word": "green",
      "hint": "The vibrant color of spring leaves and emeralds."
    },
    {
      "word": "greet",
      "hint": "To welcome a visiting friend with a warm hello."
    },
    {
      "word": "kneel",
      "hint": "To rest down on your knees."
    },
    {
      "word": "roost",
      "hint": "A wooden perch where birds sleep at night."
    },
    {
      "word": "scoop",
      "hint": "A round serving of vanilla ice cream on a cone."
    },
    {
      "word": "sleep",
      "hint": "A healthy nighttime rest that recharges your body."
    },
    {
      "word": "sleet",
      "hint": "Frozen slushy raindrops falling in winter."
    },
    {
      "word": "sweep",
      "hint": "To clean a kitchen floor with a broom."
    },
    {
      "word": "sweet",
      "hint": "Having the delicious sugary taste of honey."
    },
    {
      "word": "teeth",
      "hint": "The white enamel structures in your mouth for chewing."
    },
    {
      "word": "beast",
      "hint": "A large wild animal in nature stories."
    },
    {
      "word": "bread",
      "hint": "A baked staple food made from flour and yeast."
    },
    {
      "word": "cheap",
      "hint": "Inexpensive and costing very little money."
    },
    {
      "word": "clean",
      "hint": "Free from any dirt, dust, or smudges."
    },
    {
      "word": "cream",
      "hint": "The thick, rich dairy layer on top of fresh milk."
    },
    {
      "word": "dream",
      "hint": "A collection of wonderful thoughts while sleeping."
    },
    {
      "word": "feast",
      "hint": "A huge, delicious banquet meal with many dishes."
    },
    {
      "word": "great",
      "hint": "Wonderful, immense, and full of excellence."
    },
    {
      "word": "peach",
      "hint": "A sweet juicy fruit with fuzzy orange-pink skin."
    },
    {
      "word": "reach",
      "hint": "To stretch your arm out to grasp a book."
    },
    {
      "word": "speak",
      "hint": "To say words aloud using your voice."
    },
    {
      "word": "steam",
      "hint": "Hot visible water vapor rising from a kettle."
    },
    {
      "word": "teach",
      "hint": "To help students learn exciting new knowledge."
    },
    {
      "word": "treat",
      "hint": "A special snack or a kind surprise for a friend."
    },
    {
      "word": "yeast",
      "hint": "Tiny organisms that make bread dough rise tall."
    },
    {
      "word": "cloak",
      "hint": "A long flowing outer cape worn over clothing."
    },
    {
      "word": "coach",
      "hint": "A helpful mentor who trains a sports team."
    },
    {
      "word": "coast",
      "hint": "The scenic border where land meets the ocean."
    },
    {
      "word": "float",
      "hint": "To stay resting on the surface of water."
    },
    {
      "word": "groan",
      "hint": "A deep sound made when lifting something heavy."
    },
    {
      "word": "roast",
      "hint": "To bake vegetables or nuts until crisp and golden."
    },
    {
      "word": "toast",
      "hint": "Sliced bread warmed until crispy and browned."
    },
    {
      "word": "fruit",
      "hint": "The sweet seed-bearing part of a flowering plant."
    },
    {
      "word": "juice",
      "hint": "A healthy liquid squeezed from fresh oranges."
    },
    {
      "word": "guide",
      "hint": "A knowledgeable leader showing the way on trails."
    },
    {
      "word": "build",
      "hint": "To construct a tower out of wooden blocks."
    },
    {
      "word": "suite",
      "hint": "A connected set of hotel rooms."
    },
    {
      "word": "bloom",
      "hint": "When flower petals open up in the warm spring sun."
    },
    {
      "word": "brook",
      "hint": "A small, clear stream flowing through a forest."
    },
    {
      "word": "broom",
      "hint": "A long-handled sweeping tool with straw bristles."
    },
    {
      "word": "crook",
      "hint": "A hooked wooden staff used by shepherds."
    },
    {
      "word": "floor",
      "hint": "The surface of a room that you walk upon."
    },
    {
      "word": "groom",
      "hint": "To brush and care for a pony coat."
    },
    {
      "word": "moose",
      "hint": "A giant forest deer with wide, flat antlers."
    },
    {
      "word": "proof",
      "hint": "Evidence that shows something is undeniably true."
    },
    {
      "word": "spoon",
      "hint": "An eating utensil with a small oval bowl."
    },
    {
      "word": "stool",
      "hint": "A simple seat without back or armrests."
    },
    {
      "word": "swoop",
      "hint": "To sweep down gracefully through the air like an owl."
    },
    {
      "word": "tooth",
      "hint": "One of the hard white enamel structures in your mouth used for chewing."
    },
    {
      "word": "troop",
      "hint": "A friendly group of scouts or explorers."
    },
    {
      "word": "cloud",
      "hint": "A fluffy white mass of water vapor in the blue sky."
    },
    {
      "word": "couch",
      "hint": "A comfortable padded sofa for sitting with family."
    },
    {
      "word": "count",
      "hint": "To recite numbers in order to find a total."
    },
    {
      "word": "flour",
      "hint": "Powder ground from wheat used for baking cakes."
    },
    {
      "word": "house",
      "hint": "A building where a family lives happily."
    },
    {
      "word": "mound",
      "hint": "A small raised hill of earth in a baseball park."
    },
    {
      "word": "mount",
      "hint": "To climb up onto a bicycle seat or pony."
    },
    {
      "word": "mouse",
      "hint": "A tiny rodent with round ears, or a computer tool."
    },
    {
      "word": "mouth",
      "hint": "The facial opening used for speaking and smiling."
    },
    {
      "word": "pouch",
      "hint": "A small pocket, like where a kangaroo carries her baby."
    },
    {
      "word": "proud",
      "hint": "Feeling happy and fulfilled about a great accomplishment."
    },
    {
      "word": "round",
      "hint": "Shaped like a circle or ball."
    },
    {
      "word": "scout",
      "hint": "A young explorer who learns outdoor survival skills."
    },
    {
      "word": "snout",
      "hint": "The projecting nose and mouth of an animal."
    },
    {
      "word": "sound",
      "hint": "Vibrations in air heard by your ears."
    },
    {
      "word": "south",
      "hint": "The compass direction opposite of north."
    },
    {
      "word": "spout",
      "hint": "A tube through which water pours from a teapot."
    },
    {
      "word": "trout",
      "hint": "A speckled freshwater fish that swims in cold rivers."
    },
    {
      "word": "brown",
      "hint": "The warm earthy color of tree bark and chocolate."
    },
    {
      "word": "clown",
      "hint": "A funny circus performer with a red nose and shoes."
    },
    {
      "word": "crowd",
      "hint": "A large gathering of people cheering at a game."
    },
    {
      "word": "crown",
      "hint": "A golden ornamental circle worn by kings and queens."
    },
    {
      "word": "drown",
      "hint": "To stay safe around water with lifejackets and swimming."
    },
    {
      "word": "frown",
      "hint": "A sad facial expression turning down the mouth."
    },
    {
      "word": "growl",
      "hint": "A low rumbling sound made by a playful puppy."
    },
    {
      "word": "prowl",
      "hint": "To move stealthily and quietly like a cat."
    },
    {
      "word": "avoid",
      "hint": "To stay clear away from hazards on a bike trail."
    },
    {
      "word": "spoil",
      "hint": "To treat someone extra kindly on their birthday."
    },
    {
      "word": "voice",
      "hint": "The sound produced when you speak or sing."
    },
    {
      "word": "moist",
      "hint": "Slightly damp, like rich garden potting soil."
    },
    {
      "word": "point",
      "hint": "To direct attention with an index finger."
    },
    {
      "word": "noise",
      "hint": "A loud, energetic sound."
    },
    {
      "word": "acorn",
      "hint": "The small oval nut of an oak tree with a tiny cap."
    },
    {
      "word": "chart",
      "hint": "A sheet of paper showing diagrams or weather data."
    },
    {
      "word": "march",
      "hint": "To walk with rhythmic, measured steps in a band."
    },
    {
      "word": "park",
      "hint": "A green public recreation area with swings and trees."
    },
    {
      "word": "scarf",
      "hint": "A cozy woolen cloth wrapped around your neck in winter."
    },
    {
      "word": "smart",
      "hint": "Clever, knowledgeable, and quick to learn."
    },
    {
      "word": "spark",
      "hint": "A tiny glowing flash of fire from a campfire."
    },
    {
      "word": "start",
      "hint": "The beginning point of a race or adventure."
    },
    {
      "word": "clover",
      "hint": "A small green meadow plant, sometimes with four leaves."
    },
    {
      "word": "enter",
      "hint": "To walk through an open doorway into a room."
    },
    {
      "word": "liver",
      "hint": "An important internal organ that cleans your blood."
    },
    {
      "word": "never",
      "hint": "At no time in the past or future."
    },
    {
      "word": "otter",
      "hint": "A playful water mammal that loves sliding down muddy banks."
    },
    {
      "word": "paper",
      "hint": "Sheets made from wood pulp used for writing stories."
    },
    {
      "word": "river",
      "hint": "A natural freshwater stream flowing to the ocean."
    },
    {
      "word": "silver",
      "hint": "A shiny grayish-white precious metal used for coins."
    },
    {
      "word": "tiger",
      "hint": "A majestic big wild cat with orange and black stripes."
    },
    {
      "word": "water",
      "hint": "The clear essential liquid all living things drink."
    },
    {
      "word": "birth",
      "hint": "The joyful arrival of a newborn baby into the world."
    },
    {
      "word": "first",
      "hint": "Coming before all others in order or time (1st)."
    },
    {
      "word": "skirt",
      "hint": "A garment hanging down from the waist."
    },
    {
      "word": "swirl",
      "hint": "To move in spinning circular spirals like soft ice cream."
    },
    {
      "word": "twirl",
      "hint": "To spin around lightly on your toes like a dancer."
    },
    {
      "word": "chord",
      "hint": "Three or more musical notes played together on piano."
    },
    {
      "word": "flora",
      "hint": "The collective plant life of a particular region."
    },
    {
      "word": "force",
      "hint": "A push or pull applied to move an object."
    },
    {
      "word": "forge",
      "hint": "A blacksmith workshop where iron is shaped with heat."
    },
    {
      "word": "horse",
      "hint": "A graceful riding mammal with hooves and a flowing mane."
    },
    {
      "word": "north",
      "hint": "The direction pointing toward the Arctic ice pole."
    },
    {
      "word": "porch",
      "hint": "A covered wooden entryway outside the front door."
    },
    {
      "word": "score",
      "hint": "The tally of points earned in a soccer match."
    },
    {
      "word": "snort",
      "hint": "An energetic breath sound made through the nose by a horse."
    },
    {
      "word": "sport",
      "hint": "An athletic game played for health and teamwork."
    },
    {
      "word": "storm",
      "hint": "A weather event bringing strong wind and rain."
    },
    {
      "word": "story",
      "hint": "A narrative tale about exciting characters and adventures."
    },
    {
      "word": "sword",
      "hint": "A toy wooden foil used in costume knight adventures."
    },
    {
      "word": "torch",
      "hint": "A handheld flame or flashlight that illuminates dark caves."
    },
    {
      "word": "nurse",
      "hint": "A kind healthcare worker who helps patients heal."
    },
    {
      "word": "purse",
      "hint": "A small bag used for carrying coins and keys."
    },
    {
      "word": "spurt",
      "hint": "A sudden brief stream of water from a garden hose."
    },
    {
      "word": "surf",
      "hint": "The breaking white foam of ocean waves on a beach."
    },
    {
      "word": "turtle",
      "hint": "A slow-moving reptile with a hard protective shell."
    },
    {
      "word": "apple",
      "hint": "A crisp, sweet red or green orchard fruit."
    },
    {
      "word": "basic",
      "hint": "Simple and forming the foundation of a subject."
    },
    {
      "word": "brave",
      "hint": "Courageous in the face of a challenge."
    },
    {
      "word": "brick",
      "hint": "A sturdy rectangular clay block used in construction."
    },
    {
      "word": "cabin",
      "hint": "A cozy wooden home built near a mountain lake."
    },
    {
      "word": "camel",
      "hint": "A desert mammal with humps that can travel without water."
    },
    {
      "word": "candy",
      "hint": "A sweet sugary confectionery treat."
    },
    {
      "word": "dance",
      "hint": "Rhythmic movement of the body to joyful music."
    },
    {
      "word": "eagle",
      "hint": "A majestic bird of prey with keen eyesight and wings."
    },
    {
      "word": "extra",
      "hint": "More than what is strictly needed; additional."
    },
    {
      "word": "fairy",
      "hint": "A magical tiny winged creature from storybooks."
    },
    {
      "word": "giant",
      "hint": "Enormous and towering high above normal size."
    },
    {
      "word": "globe",
      "hint": "A round spherical model of planet Earth."
    },
    {
      "word": "happy",
      "hint": "Feeling or showing pleasure, contentment, and joy."
    },
    {
      "word": "jelly",
      "hint": "A sweet clear fruit spread that jiggles in a jar."
    },
    {
      "word": "lemon",
      "hint": "A sour, bright yellow citrus fruit with tangy tart juice."
    },
    {
      "word": "magic",
      "hint": "The art of performing wonderful, puzzling illusions."
    },
    {
      "word": "melon",
      "hint": "A sweet juicy fruit with a thick rind."
    },
    {
      "word": "music",
      "hint": "Organized sounds and melodies that are lovely to hear."
    },
    {
      "word": "ocean",
      "hint": "The vast body of saltwater covering most of the Earth."
    },
    {
      "word": "piano",
      "hint": "A large musical instrument with 88 black and white keys."
    },
    {
      "word": "pizza",
      "hint": "A baked flatbread crust topped with tomato sauce and cheese."
    },
    {
      "word": "puppy",
      "hint": "A playful baby dog."
    },
    {
      "word": "robot",
      "hint": "A mechanical machine programmed to perform tasks."
    },
    {
      "word": "salad",
      "hint": "A healthy dish of fresh crisp lettuce and vegetables."
    },
    {
      "word": "smile",
      "hint": "A happy curving up of the lips that shows kindness."
    },
    {
      "word": "space",
      "hint": "The infinite starry expanse beyond Earth atmosphere."
    },
    {
      "word": "tulip",
      "hint": "A colorful cup-shaped spring garden flower."
    },
    {
      "word": "uncle",
      "hint": "The brother of your mother or father."
    },
    {
      "word": "zebra",
      "hint": "An African wild horse with striking black and white stripes."
    }
  ],
  "4": [
    {
      "word": "sunflower",
      "hint": "A tall garden plant with massive golden-yellow petals."
    },
    {
      "word": "butterfly",
      "hint": "An insect with two pairs of large, colorful patterned wings."
    },
    {
      "word": "dragonfly",
      "hint": "A fast-flying insect with four transparent wings and long body."
    },
    {
      "word": "jellyfish",
      "hint": "A free-swimming marine creature with a gelatinous bell."
    },
    {
      "word": "starfish",
      "hint": "A five-armed sea creature that crawls along the ocean floor."
    },
    {
      "word": "seahorse",
      "hint": "A small marine fish with an upright posture and horse-like snout."
    },
    {
      "word": "goldfish",
      "hint": "A small orange ornamental freshwater fish kept in aquariums."
    },
    {
      "word": "grasshopper",
      "hint": "A plant-eating leaping insect with powerful long hind legs."
    },
    {
      "word": "rattlesnake",
      "hint": "A wild desert snake with a buzzing rattle on its tail."
    },
    {
      "word": "earthworm",
      "hint": "A burrowing segmented worm that enriches garden soil."
    },
    {
      "word": "ladybug",
      "hint": "A small round red beetle dotted with black spots."
    },
    {
      "word": "bluebird",
      "hint": "A colorful North American songbird with bright blue feathers."
    },
    {
      "word": "songbird",
      "hint": "A bird with a melodious musical call."
    },
    {
      "word": "woodpecker",
      "hint": "A bird that pecks tree trunks with its strong beak to find insects."
    },
    {
      "word": "honeybee",
      "hint": "A fuzzy yellow-and-black insect that produces sweet honey in hives."
    },
    {
      "word": "bullfrog",
      "hint": "A large green frog with a deep bellowing croak."
    },
    {
      "word": "tadpole",
      "hint": "A baby frog that swims in ponds with a tail and gills."
    },
    {
      "word": "chipmunk",
      "hint": "A small striped woodland rodent that gathers acorns."
    },
    {
      "word": "hedgehog",
      "hint": "A small nocturnal mammal covered in defensive quills."
    },
    {
      "word": "pinecone",
      "hint": "The scaled woody fruit of an evergreen pine tree containing seeds."
    },
    {
      "word": "buttercup",
      "hint": "A bright yellow wild meadow flower with glossy petals."
    },
    {
      "word": "grapevine",
      "hint": "A climbing woody vine that produces juicy purple grapes."
    },
    {
      "word": "driftwood",
      "hint": "Pieces of weathered wood washed ashore onto ocean beaches."
    },
    {
      "word": "seaweed",
      "hint": "Marine algae growing in ocean waters that shelters fish."
    },
    {
      "word": "seashell",
      "hint": "The hard protective outer casing of a marine clam or snail."
    },
    {
      "word": "seafoam",
      "hint": "Frothy white bubbles created on ocean shores by crashing waves."
    },
    {
      "word": "tidewater",
      "hint": "Water overflowing land when ocean tides rise high."
    },
    {
      "word": "rainbow",
      "hint": "An arch of vibrant colors in the sky caused by sunlight and rain."
    },
    {
      "word": "waterfall",
      "hint": "A cascade of river water falling vertically over a high cliff."
    },
    {
      "word": "raindrop",
      "hint": "A single bead of liquid water falling from rain clouds."
    },
    {
      "word": "snowflake",
      "hint": "A unique hexagonal crystal of frozen water falling in winter."
    },
    {
      "word": "snowball",
      "hint": "A sphere of fresh snow packed tightly by hand for tossing."
    },
    {
      "word": "snowstorm",
      "hint": "A heavy winter storm with falling snow and gusty winds."
    },
    {
      "word": "sunshine",
      "hint": "The direct warmth and radiant light coming from the sun."
    },
    {
      "word": "sunbeam",
      "hint": "A single ray of golden sunlight breaking through clouds."
    },
    {
      "word": "sunrise",
      "hint": "The magical moment each morning when the sun climbs above the horizon."
    },
    {
      "word": "sunset",
      "hint": "The colorful evening time when the sun sinks below the western hills."
    },
    {
      "word": "moonlight",
      "hint": "The soft silver illumination reflected from the night moon."
    },
    {
      "word": "moonbeam",
      "hint": "A beam of gentle light shining down from the full moon."
    },
    {
      "word": "starlight",
      "hint": "The sparkling twinkling light emitted by distant stars at night."
    },
    {
      "word": "starburst",
      "hint": "A sudden energetic radiating pattern of brilliant stars."
    },
    {
      "word": "nightfall",
      "hint": "The onset of darkness as evening transitions into night."
    },
    {
      "word": "daylight",
      "hint": "The natural bright illumination of the Earth during the daytime."
    },
    {
      "word": "sandstorm",
      "hint": "A desert windstorm carrying thick clouds of swirling sand."
    },
    {
      "word": "whirlwind",
      "hint": "A spinning column of air rotating rapidly across open ground."
    },
    {
      "word": "thunderstorm",
      "hint": "A dramatic weather storm with rumbling thunder and lightning."
    },
    {
      "word": "cloudburst",
      "hint": "A sudden, torrential downpour of heavy rain."
    },
    {
      "word": "quicksand",
      "hint": "Loose water-saturated sand that yields under pressure."
    },
    {
      "word": "sandcastle",
      "hint": "A miniature castle sculpture built out of damp beach sand."
    },
    {
      "word": "coastline",
      "hint": "The dynamic border boundary where land meets the vast sea."
    },
    {
      "word": "shoreline",
      "hint": "The edge of land along an ocean, lake, or wide river."
    },
    {
      "word": "riverbank",
      "hint": "The rising green ground along the side of a flowing river."
    },
    {
      "word": "foothills",
      "hint": "Low rolling hills situated at the base of a high mountain range."
    },
    {
      "word": "marshland",
      "hint": "Low-lying wetland ground saturated with water and tall grasses."
    },
    {
      "word": "snowman",
      "hint": "A whimsical figure built from three stacked spheres of winter snow."
    },
    {
      "word": "snowplow",
      "hint": "A vehicle equipped with a wide blade to clear snow from roads."
    },
    {
      "word": "pancake",
      "hint": "A flat round batter cake cooked on a griddle and served with syrup."
    },
    {
      "word": "cupcake",
      "hint": "A small individual dessert cake baked inside a paper liner."
    },
    {
      "word": "popcorn",
      "hint": "Corn kernels that burst open into puffy white snacks when heated."
    },
    {
      "word": "strawberry",
      "hint": "A sweet red berry dotted with tiny exterior seeds."
    },
    {
      "word": "watermelon",
      "hint": "A large juicy melon that is green outside and sweet red inside."
    },
    {
      "word": "blueberry",
      "hint": "A small sweet dark-blue berry packed with healthy vitamins."
    },
    {
      "word": "blackberry",
      "hint": "A delicious dark purple bramble berry that grows on bushes."
    },
    {
      "word": "raspberry",
      "hint": "A delicate red berry with a hollow core and sweet-tart taste."
    },
    {
      "word": "pineapple",
      "hint": "A tropical fruit with spiky yellow skin and sweet golden meat."
    },
    {
      "word": "peanut",
      "hint": "An edible legume seed encased in a brittle woody pod."
    },
    {
      "word": "teacup",
      "hint": "A small delicate porcelain cup used for drinking herbal tea."
    },
    {
      "word": "teapot",
      "hint": "A lidded ceramic kettle with a spout used for brewing tea."
    },
    {
      "word": "teaspoon",
      "hint": "A small spoon used for measuring baking ingredients or stirring."
    },
    {
      "word": "tablecloth",
      "hint": "A decorative fabric spread over a dining table for dinner."
    },
    {
      "word": "cookbook",
      "hint": "A reference book containing delicious culinary recipes."
    },
    {
      "word": "gingerbread",
      "hint": "A spiced molasses cookie dough cut into festive holiday shapes."
    },
    {
      "word": "peppermint",
      "hint": "A cool, refreshing aromatic mint used in festive candy canes."
    },
    {
      "word": "doughnut",
      "hint": "A sweet fried dough ring with colorful glaze and sprinkles."
    },
    {
      "word": "applesauce",
      "hint": "Cooked pureed apples seasoned with sweet cinnamon."
    },
    {
      "word": "grapefruit",
      "hint": "A large citrus fruit with tangy pink or yellow pulp."
    },
    {
      "word": "milkshake",
      "hint": "A chilled beverage made by blending milk and ice cream."
    },
    {
      "word": "honeycomb",
      "hint": "A hexagonal wax structure made by bees to store sweet honey."
    },
    {
      "word": "fishhook",
      "hint": "A curved metal barb tied to a fishing line."
    },
    {
      "word": "backpack",
      "hint": "A sturdy canvas bag carried on the back by school students."
    },
    {
      "word": "textbook",
      "hint": "A comprehensive study book used for a school curriculum subject."
    },
    {
      "word": "bookmark",
      "hint": "A strip of card or ribbon placed in a book to mark your page."
    },
    {
      "word": "notebook",
      "hint": "A bound collection of blank or ruled paper pages for writing notes."
    },
    {
      "word": "classroom",
      "hint": "A school room where teachers and students learn together."
    },
    {
      "word": "chalkboard",
      "hint": "A smooth black or dark green slate board for writing with chalk."
    },
    {
      "word": "whiteboard",
      "hint": "A glossy white marker board used for interactive lessons."
    },
    {
      "word": "playground",
      "hint": "An outdoor school area equipped with swings, slides, and games."
    },
    {
      "word": "basketball",
      "hint": "A team sport played by bouncing a ball and shooting through hoops."
    },
    {
      "word": "baseball",
      "hint": "A sport played with bats, gloves, and bases on a diamond field."
    },
    {
      "word": "football",
      "hint": "A popular team sport played on a 100-yard field with end zones."
    },
    {
      "word": "skateboard",
      "hint": "A narrow wooden deck mounted on four wheels ridden for sport."
    },
    {
      "word": "snowboard",
      "hint": "A wide board strapped to boots for gliding down snowy mountains."
    },
    {
      "word": "springboard",
      "hint": "A flexible board used by gymnasts and divers for upward leap."
    },
    {
      "word": "surfboard",
      "hint": "A narrow buoyant fiberglass board used for riding ocean waves."
    },
    {
      "word": "campsite",
      "hint": "A designated natural area where campers pitch their tents."
    },
    {
      "word": "campfire",
      "hint": "An outdoor open wood fire built at a camping site for warmth."
    },
    {
      "word": "fireplace",
      "hint": "A brick structure at the base of a chimney for burning hearth logs."
    },
    {
      "word": "lighthouse",
      "hint": "A coastal tower equipped with a flashing beacon to guide ships safely."
    },
    {
      "word": "scarecrow",
      "hint": "A straw-filled dummy dressed in old clothes to protect farmer crops."
    },
    {
      "word": "birdhouse",
      "hint": "A small wooden shelter crafted for wild birds to nest in safely."
    },
    {
      "word": "doghouse",
      "hint": "A cozy outdoor shelter built for a pet dog."
    },
    {
      "word": "farmhouse",
      "hint": "The main residential dwelling located on an agricultural farm."
    },
    {
      "word": "barnyard",
      "hint": "The open fenced enclosure surrounding a red farm barn."
    },
    {
      "word": "windmill",
      "hint": "A tower with rotating sails driven by wind to pump water or grind grain."
    },
    {
      "word": "railroad",
      "hint": "A permanent track of steel rails on which passenger trains run."
    },
    {
      "word": "crosswalk",
      "hint": "A marked pedestrian lane across a roadway for safe street crossing."
    },
    {
      "word": "sidewalk",
      "hint": "A paved footpath running beside a city street for pedestrians."
    },
    {
      "word": "pathway",
      "hint": "A narrow scenic trail winding through a garden or forest."
    },
    {
      "word": "driveway",
      "hint": "A private short road leading from a public street to a home garage."
    },
    {
      "word": "doorway",
      "hint": "The opening in a wall through which a door swings."
    },
    {
      "word": "doorstep",
      "hint": "A step directly in front of an exterior building door."
    },
    {
      "word": "doormat",
      "hint": "A bristled mat placed outside an entrance for wiping shoe soles."
    },
    {
      "word": "horseshoe",
      "hint": "A U-shaped iron protective shoe nailed to a horse hoof."
    },
    {
      "word": "wheelbarrow",
      "hint": "A single-wheeled cart with two handles used in garden work."
    },
    {
      "word": "cobblestone",
      "hint": "A rounded natural stone used in paving historical city streets."
    },
    {
      "word": "patchwork",
      "hint": "Needlework created by sewing varied colorful fabric scraps together."
    },
    {
      "word": "shoelace",
      "hint": "A flexible cord passed through shoe eyelets to tie footwear."
    },
    {
      "word": "blueprint",
      "hint": "A detailed architectural plan or engineering drawing."
    },
    {
      "word": "flashlight",
      "hint": "A handheld portable electric light powered by batteries."
    },
    {
      "word": "wristwatch",
      "hint": "A small timepiece worn strapped around the wrist."
    },
    {
      "word": "eyeglasses",
      "hint": "Frames holding optical glass lenses to assist clear eyesight."
    },
    {
      "word": "sunglasses",
      "hint": "Dark-tinted spectacles that shield eyes from bright sunny glare."
    },
    {
      "word": "earring",
      "hint": "A decorative jewelry hoop or stud worn on the earlobe."
    },
    {
      "word": "raincoat",
      "hint": "A waterproof jacket designed to keep you dry during rain showers."
    },
    {
      "word": "earmuffs",
      "hint": "A pair of warm padded fabric covers connected by a flexible band."
    },
    {
      "word": "spotlight",
      "hint": "A lamp projecting a bright narrow beam of light onto a stage actor."
    },
    {
      "word": "sailboat",
      "hint": "A boat propelled across water by wind captured in broad sails."
    },
    {
      "word": "steamboat",
      "hint": "A paddlewheel riverboat powered by a steam engine."
    },
    {
      "word": "tugboat",
      "hint": "A small, powerful harbor boat used to maneuver large cargo ships."
    },
    {
      "word": "rowboat",
      "hint": "A small open wooden boat propelled through water with pairs of oars."
    },
    {
      "word": "airport",
      "hint": "A complex where airplanes take off, land, and board passengers."
    },
    {
      "word": "aircraft",
      "hint": "Any vehicle capable of atmospheric flight, like planes or gliders."
    },
    {
      "word": "spaceship",
      "hint": "A spacecraft built for navigating the cosmos beyond Earth."
    },
    {
      "word": "spacesuit",
      "hint": "A pressurized protective suit worn by astronauts in outer space."
    },
    {
      "word": "swordfish",
      "hint": "A large ocean fish characterized by a long flat bill like a sword."
    },
    {
      "word": "toolbox",
      "hint": "A sturdy box used to organize hammers, screwdrivers, and pliers."
    },
    {
      "word": "workbench",
      "hint": "A heavy wooden table at which a carpenter or builder works."
    },
    {
      "word": "wheelhouse",
      "hint": "The enclosed bridge cabin on a ship where the helm wheel is."
    },
    {
      "word": "windchime",
      "hint": "Suspended metal or bamboo tubes that sound melodiously in the breeze."
    },
    {
      "word": "sandbox",
      "hint": "A shallow wooden box filled with clean sand for children to build in."
    },
    {
      "word": "fingernail",
      "hint": "The hard protective keratin plate on the upper tip of each finger."
    },
    {
      "word": "doorbell",
      "hint": "An electric chime button at an entrance rung by visitors."
    },
    {
      "word": "daydream",
      "hint": "A pleasant visionary series of waking thoughts and imagination."
    },
    {
      "word": "footprint",
      "hint": "An impression left in sand, mud, or snow by a walking foot."
    },
    {
      "word": "keyboard",
      "hint": "A board of letter and number keys used for typing on computers."
    },
    {
      "word": "bedroom",
      "hint": "A cozy private room furnished with a bed for nightly sleep."
    },
    {
      "word": "toothbrush",
      "hint": "A small bristled handheld brush used with paste to clean teeth."
    },
    {
      "word": "treehouse",
      "hint": "A wooden playhouse built securely up in the branches of a tree."
    },
    {
      "word": "playhouse",
      "hint": "A miniature toy house built in a backyard for children games."
    },
    {
      "word": "clubhouse",
      "hint": "A meeting building for members of a team or social club."
    },
    {
      "word": "boathouse",
      "hint": "A waterside shed designed for storing canoes and rowboats."
    },
    {
      "word": "greenhouse",
      "hint": "A glass building used for growing delicate plants and flowers."
    },
    {
      "word": "courtyard",
      "hint": "An unroofed open area surrounded by the walls of a castle or school."
    },
    {
      "word": "backyard",
      "hint": "The open grassy garden area situated behind a family house."
    },
    {
      "word": "paddleboard",
      "hint": "A long buoyant board propelled with a paddle while standing."
    },
    {
      "word": "motorboat",
      "hint": "A fast boat propelled across water by an inboard motor."
    },
    {
      "word": "lifejacket",
      "hint": "A buoyant safety vest worn to keep a swimmer afloat."
    },
    {
      "word": "lifeboat",
      "hint": "A small rescue boat carried on a ship for emergencies."
    },
    {
      "word": "lifesaver",
      "hint": "A rescuer who saves people from danger in ocean water."
    },
    {
      "word": "coastguard",
      "hint": "An organization responsible for coastal maritime safety and rescue."
    },
    {
      "word": "foghorn",
      "hint": "A loud, deep horn sounded in foggy weather to warn ships."
    },
    {
      "word": "seaport",
      "hint": "A bustling coastal town with harbor facilities for large ships."
    },
    {
      "word": "spaceport",
      "hint": "A launch facility designed for launching rocket spacecraft."
    },
    {
      "word": "airfield",
      "hint": "An open area of level ground where airplanes take off."
    },
    {
      "word": "runway",
      "hint": "A long paved strip on which planes land and take off."
    },
    {
      "word": "highway",
      "hint": "A main public road connecting cities across a state."
    },
    {
      "word": "freeway",
      "hint": "A high-speed divided highway without stoplights or tolls."
    },
    {
      "word": "speedway",
      "hint": "A race track designed for high-speed automobile racing."
    },
    {
      "word": "footbridge",
      "hint": "A charming narrow bridge designed for pedestrian walkers."
    },
    {
      "word": "overpass",
      "hint": "A bridge that carries one road directly over another."
    },
    {
      "word": "underpass",
      "hint": "A road or tunnel passing underneath a railway or highway."
    },
    {
      "word": "drawbridge",
      "hint": "A hinged castle bridge that can be raised to prevent crossing."
    },
    {
      "word": "boardwalk",
      "hint": "A wooden promenade pathway built along a beach oceanfront."
    },
    {
      "word": "handprint",
      "hint": "An impression or painted stamp made by a human hand."
    },
    {
      "word": "thumbprint",
      "hint": "The unique spiral impression made by the tip of a thumb."
    },
    {
      "word": "handrail",
      "hint": "A sturdy rail designed to be grasped by hand for safety on stairs."
    },
    {
      "word": "guardrail",
      "hint": "A protective barrier along the edge of a balcony or mountain road."
    },
    {
      "word": "windowpane",
      "hint": "A single clear pane of glass in a house window."
    },
    {
      "word": "skylight",
      "hint": "A window set into a roof or ceiling to let in natural daylight."
    },
    {
      "word": "headlight",
      "hint": "A powerful forward-facing beam light on the front of a car."
    },
    {
      "word": "taillight",
      "hint": "A red safety light on the rear of a motor vehicle."
    },
    {
      "word": "floodlight",
      "hint": "A large powerful lamp used to illuminate a soccer stadium."
    },
    {
      "word": "searchlight",
      "hint": "A powerful light equipped with a reflector to track objects."
    },
    {
      "word": "nightlight",
      "hint": "A dim comforting lamp kept illuminated in a bedroom overnight."
    },
    {
      "word": "candlelight",
      "hint": "The soft golden flickering glow provided by a burning candle."
    },
    {
      "word": "firelight",
      "hint": "The warm dancing glow radiating from a cozy fireplace."
    },
    {
      "word": "lamplight",
      "hint": "The gentle illumination given off by a reading lamp."
    },
    {
      "word": "bookworm",
      "hint": "A person who loves reading books with passion and delight."
    },
    {
      "word": "bookstore",
      "hint": "A shop where interesting new books and magazines are sold."
    },
    {
      "word": "bookbag",
      "hint": "A sturdy tote bag used for carrying library books."
    },
    {
      "word": "scrapbook",
      "hint": "An album with blank pages for mounting family photos and keepsakes."
    },
    {
      "word": "sketchbook",
      "hint": "A bound drawing pad used by artists for sketching ideas."
    },
    {
      "word": "yearbook",
      "hint": "An annual school memory book celebrating students and clubs."
    },
    {
      "word": "guidebook",
      "hint": "A handbook of information about a travel destination or park."
    },
    {
      "word": "handbook",
      "hint": "A concise reference manual giving guidance on a subject."
    },
    {
      "word": "storybook",
      "hint": "A book of illustrated fairy tales and bedtime adventures."
    },
    {
      "word": "picturebook",
      "hint": "A book consisting mainly of vibrant colorful artwork illustrations."
    },
    {
      "word": "comicbook",
      "hint": "A magazine of illustrated sequential comic art panels."
    },
    {
      "word": "bumblebee",
      "hint": "A large, fuzzy yellow-and-black bee that pollinates clover."
    },
    {
      "word": "firefly",
      "hint": "A gentle beetle that emits glowing bioluminescent light on summer nights."
    },
    {
      "word": "silkworm",
      "hint": "A caterpillar that spins a delicate cocoon of fine silk thread."
    },
    {
      "word": "treefrog",
      "hint": "A small colorful amphibian with suction pads on its toes for climbing."
    },
    {
      "word": "bluejay",
      "hint": "A noisy, crest-headed songbird with vibrant blue and white plumage."
    },
    {
      "word": "mockingbird",
      "hint": "A clever gray songbird that mimics the calls of other birds."
    },
    {
      "word": "hummingbird",
      "hint": "A tiny iridescent bird that hovers in air and sips flower nectar."
    },
    {
      "word": "kingfisher",
      "hint": "A brightly colored bird with a long beak that dives for fish."
    },
    {
      "word": "sandpiper",
      "hint": "A small wading bird with a slender bill that scurries along beach shores."
    },
    {
      "word": "whirlpool",
      "hint": "A rapidly rotating vortex of swirling water in a river or ocean."
    },
    {
      "word": "snowdrift",
      "hint": "A deep bank of snow piled high by the howling winter wind."
    },
    {
      "word": "snowpack",
      "hint": "The accumulated layer of compressed mountain snow that melts into rivers."
    },
    {
      "word": "waterspout",
      "hint": "A swirling column of water and cloud occurring over lakes or seas."
    },
    {
      "word": "lakeside",
      "hint": "The scenic land area immediately bordering a calm mountain lake."
    },
    {
      "word": "seaside",
      "hint": "A coastal resort area located right along the ocean beach."
    },
    {
      "word": "mountainside",
      "hint": "The sloping side surface of a majestic mountain."
    },
    {
      "word": "cliffside",
      "hint": "The sheer rock wall area along a steep coastal cliff."
    },
    {
      "word": "wonderland",
      "hint": "A marvelous imaginary landscape filled with magical wonders."
    },
    {
      "word": "fairyland",
      "hint": "The enchanted mythical realm inhabited by woodland fairies."
    },
    {
      "word": "mushroom",
      "hint": "An umbrella-shaped fungal growth that sprouts in forest moss."
    },
    {
      "word": "toadstool",
      "hint": "A colorful mushroom cap often illustrated in storybooks."
    },
    {
      "word": "wildflower",
      "hint": "A colorful flower that grows naturally in open alpine meadows."
    },
    {
      "word": "bluebell",
      "hint": "A woodland plant with drooping bell-shaped blue-purple flowers."
    },
    {
      "word": "honeysuckle",
      "hint": "A climbing shrub with fragrant tubular flowers full of sweet nectar."
    },
    {
      "word": "milkweed",
      "hint": "A meadow plant with silky seeds that monarch butterflies love."
    },
    {
      "word": "snapdragon",
      "hint": "A garden flower with blossoms shaped like opening dragon jaws."
    },
    {
      "word": "sweetpea",
      "hint": "A climbing garden plant with fragrant pastel butterfly blossoms."
    },
    {
      "word": "cloverleaf",
      "hint": "A green leaf of clover with rounded lobes, or a highway junction."
    },
    {
      "word": "waterlily",
      "hint": "An aquatic plant with large floating round leaves and fragrant blooms."
    },
    {
      "word": "duckweed",
      "hint": "A tiny floating freshwater plant that covers calm pond surfaces."
    }
  ],
  "5": [
    {
      "word": "unhappy",
      "hint": "Not happy; feeling downcast, sorrowful, or blue."
    },
    {
      "word": "unlock",
      "hint": "To open a door latch with a key or combination code."
    },
    {
      "word": "uncover",
      "hint": "To remove a lid or reveal something hidden underneath."
    },
    {
      "word": "unwrap",
      "hint": "To take off the decorative paper from a birthday gift."
    },
    {
      "word": "unpack",
      "hint": "To remove clothes and supplies from a travel suitcase."
    },
    {
      "word": "unsure",
      "hint": "Hesitant or not completely certain about an answer."
    },
    {
      "word": "untie",
      "hint": "To loosen and undo the knot in your shoelaces."
    },
    {
      "word": "unkind",
      "hint": "Lacking gentleness, warmth, or considerate sympathy."
    },
    {
      "word": "unfair",
      "hint": "Not following the established rules of honest play."
    },
    {
      "word": "unsafe",
      "hint": "Involving potential danger, risk, or harm."
    },
    {
      "word": "unusual",
      "hint": "Out of the ordinary; rare, uncommon, and remarkable."
    },
    {
      "word": "unseen",
      "hint": "Not noticed or observed by human eyes."
    },
    {
      "word": "unknown",
      "hint": "Not familiar or recognized yet by researchers."
    },
    {
      "word": "unplug",
      "hint": "To disconnect an electrical cord from a wall outlet safely."
    },
    {
      "word": "unfold",
      "hint": "To open up a folded map or paper origami creation."
    },
    {
      "word": "rewrite",
      "hint": "To draft a composition or paragraph a second time to improve it."
    },
    {
      "word": "rebuild",
      "hint": "To construct a wooden bridge again after it was dismantled."
    },
    {
      "word": "replay",
      "hint": "To play back a video clip or favorite song again."
    },
    {
      "word": "retell",
      "hint": "To recount a classic fairy tale story in your own words."
    },
    {
      "word": "rethink",
      "hint": "To reconsider a puzzle strategy with fresh perspective."
    },
    {
      "word": "refill",
      "hint": "To fill up an empty reusable water bottle to the top."
    },
    {
      "word": "return",
      "hint": "To bring a borrowed library book back on time."
    },
    {
      "word": "replace",
      "hint": "To put a new fresh battery in place of a depleted one."
    },
    {
      "word": "review",
      "hint": "To study previous class notes before a science project."
    },
    {
      "word": "renew",
      "hint": "To extend the active period of a park pass or library card."
    },
    {
      "word": "rewind",
      "hint": "To wind audio tape back to the beginning of a song."
    },
    {
      "word": "restart",
      "hint": "To launch a computer application afresh."
    },
    {
      "word": "remake",
      "hint": "To craft something over again with higher quality."
    },
    {
      "word": "rename",
      "hint": "To give a new title to a computer file or pet hamster."
    },
    {
      "word": "recheck",
      "hint": "To verify math problem calculations carefully once more."
    },
    {
      "word": "preview",
      "hint": "An advance teaser showing of a new movie before its release."
    },
    {
      "word": "preheat",
      "hint": "To warm an oven to the target baking temperature before cooking."
    },
    {
      "word": "prepay",
      "hint": "To pay for postage stamps before mailing a package."
    },
    {
      "word": "preschool",
      "hint": "An early learning nursery school for young children."
    },
    {
      "word": "prepare",
      "hint": "To make ready beforehand with all necessary supplies."
    },
    {
      "word": "prefix",
      "hint": "A word part added to the beginning of a root word to alter meaning."
    },
    {
      "word": "predict",
      "hint": "To make an educated forecast about what will happen next in a story."
    },
    {
      "word": "prehistoric",
      "hint": "Belonging to the ancient era before written human history."
    },
    {
      "word": "premade",
      "hint": "Manufactured and assembled ready for use beforehand."
    },
    {
      "word": "precook",
      "hint": "To cook food partially in advance before final baking."
    },
    {
      "word": "disagree",
      "hint": "To hold a different opinion from someone else on a topic."
    },
    {
      "word": "discover",
      "hint": "To be the first person to find or explore a new place."
    },
    {
      "word": "distrust",
      "hint": "Feeling cautious about someone reliability or honesty."
    },
    {
      "word": "disappear",
      "hint": "To vanish completely from sight like a magic trick."
    },
    {
      "word": "dislike",
      "hint": "To have a feeling of not enjoying a particular chore."
    },
    {
      "word": "disobey",
      "hint": "To fail to follow an established rule or instruction."
    },
    {
      "word": "dishonest",
      "hint": "Not telling the absolute truth; deceitful."
    },
    {
      "word": "disconnect",
      "hint": "To break a physical connection or unplug a cable."
    },
    {
      "word": "disinfect",
      "hint": "To clean a kitchen surface thoroughly to eliminate germs."
    },
    {
      "word": "disorder",
      "hint": "A state of untidiness, confusion, or lack of order."
    },
    {
      "word": "disrespect",
      "hint": "A lack of polite esteem or courtesy toward others."
    },
    {
      "word": "displace",
      "hint": "To take the physical place of another volume of water."
    },
    {
      "word": "mislead",
      "hint": "To give incorrect guidance or cause someone to believe false info."
    },
    {
      "word": "misplace",
      "hint": "To put an item in an unremembered location temporarily."
    },
    {
      "word": "miscount",
      "hint": "To tally numbers incorrectly during a count."
    },
    {
      "word": "mistake",
      "hint": "An unintentional error made during a learning exercise."
    },
    {
      "word": "misprint",
      "hint": "A typographical printing error found on a newspaper page."
    },
    {
      "word": "misread",
      "hint": "To read a word or road sign incorrectly."
    },
    {
      "word": "mistrust",
      "hint": "A lack of confidence or faith in someone reliability."
    },
    {
      "word": "misspell",
      "hint": "To spell a vocabulary word with the wrong letter order."
    },
    {
      "word": "misstep",
      "hint": "A clumsy footstep or minor error in judgment."
    },
    {
      "word": "misjudge",
      "hint": "To estimate a distance or character inaccurately."
    },
    {
      "word": "nonsense",
      "hint": "Words or ideas that make zero logical sense."
    },
    {
      "word": "nonstop",
      "hint": "Traveling straight through to a destination without layovers."
    },
    {
      "word": "nonfiction",
      "hint": "Factual literature based on real historical events and true science."
    },
    {
      "word": "nonstick",
      "hint": "Coated so food glides easily without sticking in the skillet."
    },
    {
      "word": "nonfat",
      "hint": "Containing zero grams of dairy fat, like skim milk."
    },
    {
      "word": "nonprofit",
      "hint": "An organization dedicated to charity rather than corporate money."
    },
    {
      "word": "submarine",
      "hint": "A specialized naval ship capable of operating beneath ocean waves."
    },
    {
      "word": "subway",
      "hint": "An underground passenger train network in a bustling city."
    },
    {
      "word": "submerge",
      "hint": "To dive completely under water in a swimming pool."
    },
    {
      "word": "subdivide",
      "hint": "To split a large piece of land into smaller organized lots."
    },
    {
      "word": "subtitle",
      "hint": "A secondary descriptive title, or text translations on a screen."
    },
    {
      "word": "subtotal",
      "hint": "The sum of purchase costs before taxes are calculated."
    },
    {
      "word": "subsoil",
      "hint": "The layer of earth immediately underlying the topsoil."
    },
    {
      "word": "bicycle",
      "hint": "A two-wheeled vehicle propelled by turning foot pedals."
    },
    {
      "word": "biplane",
      "hint": "An early airplane built with two pairs of stacked wings."
    },
    {
      "word": "bimonthly",
      "hint": "Occurring once every two months, or twice a month."
    },
    {
      "word": "bilingual",
      "hint": "Fluent in speaking two distinct languages."
    },
    {
      "word": "bifocals",
      "hint": "Eyeglasses equipped with two optical zones for near and far vision."
    },
    {
      "word": "bipartisan",
      "hint": "Involving cooperation between two different political groups."
    },
    {
      "word": "tricycle",
      "hint": "A three-wheeled pedal vehicle ridden by toddlers."
    },
    {
      "word": "triangle",
      "hint": "A three-sided flat geometric polygon."
    },
    {
      "word": "tripod",
      "hint": "A sturdy three-legged stand used to support a camera."
    },
    {
      "word": "triathlon",
      "hint": "An athletic contest combining swimming, cycling, and running."
    },
    {
      "word": "triplet",
      "hint": "One of three babies born at the same birth."
    },
    {
      "word": "trilogy",
      "hint": "A series of three related books or movies telling an epic tale."
    },
    {
      "word": "overflow",
      "hint": "To spill over the rim when a bathtub is filled too high."
    },
    {
      "word": "overdue",
      "hint": "Not returned by the agreed due date on a calendar."
    },
    {
      "word": "overlook",
      "hint": "To fail to notice a detail, or a scenic high cliff vantage point."
    },
    {
      "word": "overheat",
      "hint": "To become excessively hot beyond normal operating temperatures."
    },
    {
      "word": "overload",
      "hint": "To place too much heavy weight onto a cargo truck."
    },
    {
      "word": "overturn",
      "hint": "To tip upside down or reverse an earlier decision."
    },
    {
      "word": "oversee",
      "hint": "To supervise and guide a construction project team."
    },
    {
      "word": "overpower",
      "hint": "To exceed with greater strength or overwhelming force."
    },
    {
      "word": "overnight",
      "hint": "Lasting through or happening during the entire night."
    },
    {
      "word": "overhead",
      "hint": "Situated high above your head in the sky or ceiling."
    },
    {
      "word": "underwater",
      "hint": "Submerged below the surface of an ocean or swimming pool."
    },
    {
      "word": "underage",
      "hint": "Too young by legal regulations to do an adult activity."
    },
    {
      "word": "underline",
      "hint": "To draw a line underneath a sentence for emphasis."
    },
    {
      "word": "understand",
      "hint": "To comprehend the meaning and logic of an explanation."
    },
    {
      "word": "undershirt",
      "hint": "A lightweight cotton shirt worn beneath formal clothes."
    },
    {
      "word": "underestimate",
      "hint": "To guess that a task is smaller or easier than it really is."
    },
    {
      "word": "superstar",
      "hint": "An exceptionally famous, talented performer or athlete."
    },
    {
      "word": "supermarket",
      "hint": "A large grocery store selling diverse foods and household goods."
    },
    {
      "word": "superhero",
      "hint": "A brave story character possessing extraordinary noble powers."
    },
    {
      "word": "supersonic",
      "hint": "Traveling at a speed faster than the velocity of sound."
    },
    {
      "word": "superhuman",
      "hint": "Exceeding standard ordinary human abilities or endurance."
    },
    {
      "word": "international",
      "hint": "Involving cooperation between multiple countries around the globe."
    },
    {
      "word": "interact",
      "hint": "To communicate and engage socially with peers."
    },
    {
      "word": "interchange",
      "hint": "A junction where highway roads cross without stopping traffic."
    },
    {
      "word": "intersection",
      "hint": "A point where two city streets cross each other."
    },
    {
      "word": "intertwine",
      "hint": "To twist or weave two colorful strands of yarn together."
    },
    {
      "word": "transform",
      "hint": "To change completely in form, appearance, or structure."
    },
    {
      "word": "transport",
      "hint": "To carry cargo or passengers across vast distances."
    },
    {
      "word": "translate",
      "hint": "To convert spoken or written words into another language."
    },
    {
      "word": "transplant",
      "hint": "To replant a garden sapling into a bigger plot of soil."
    },
    {
      "word": "transmit",
      "hint": "To broadcast a radio signal through airwaves to receivers."
    },
    {
      "word": "careful",
      "hint": "Staying alert to avoid making avoidable mistakes."
    },
    {
      "word": "colorful",
      "hint": "Bursting with vivid, vibrant rainbow colors."
    },
    {
      "word": "joyful",
      "hint": "Full of genuine happiness, delight, and elation."
    },
    {
      "word": "painful",
      "hint": "Causing physical hurt or uncomfortable soreness."
    },
    {
      "word": "thankful",
      "hint": "Expressing warm appreciation and gratitude for kindness."
    },
    {
      "word": "hopeful",
      "hint": "Feeling positive expectation that good things will happen."
    },
    {
      "word": "playful",
      "hint": "Full of fun, lively high spirits, and cheerful games."
    },
    {
      "word": "helpful",
      "hint": "Giving useful assistance and support to friends in need."
    },
    {
      "word": "cheerful",
      "hint": "Noticeably happy, optimistic, and smiling warmly."
    },
    {
      "word": "peaceful",
      "hint": "Calm, serene, and free from disturbance or conflict."
    },
    {
      "word": "graceful",
      "hint": "Moving with effortless poise, balance, and elegance."
    },
    {
      "word": "powerful",
      "hint": "Possessing immense physical strength or influential capability."
    },
    {
      "word": "wonderful",
      "hint": "Inspiring delightful admiration; marvelous and excellent."
    },
    {
      "word": "successful",
      "hint": "Achieving the desired positive result or accomplishing a goal."
    },
    {
      "word": "delightful",
      "hint": "Providing immense charm, entertainment, and pleasure."
    },
    {
      "word": "fearless",
      "hint": "Completely devoid of fear; bold, brave, and resolute."
    },
    {
      "word": "helpless",
      "hint": "Unable to defend oneself without the assistance of others."
    },
    {
      "word": "hopeless",
      "hint": "Feeling without any hope or chance of success."
    },
    {
      "word": "painless",
      "hint": "Causing zero physical discomfort, sting, or hurt."
    },
    {
      "word": "spotless",
      "hint": "Immaculately clean without a single speck of dirt."
    },
    {
      "word": "careless",
      "hint": "Not paying sufficient attention, leading to minor mishaps."
    },
    {
      "word": "endless",
      "hint": "Having no apparent boundary, limit, or conclusion."
    },
    {
      "word": "cloudless",
      "hint": "A completely clear blue sky without a single cloud."
    },
    {
      "word": "restless",
      "hint": "Unable to rest or sit still because of energetic excitement."
    },
    {
      "word": "harmless",
      "hint": "Incapable of causing any injury, damage, or harm."
    },
    {
      "word": "speechless",
      "hint": "Temporarily unable to speak due to sheer awe and astonishment."
    },
    {
      "word": "selfless",
      "hint": "Thinking of other wellbeing before your own personal desires."
    },
    {
      "word": "tasteless",
      "hint": "Lacking distinct flavor, like a plain glass of pure water."
    },
    {
      "word": "timeless",
      "hint": "Classic and unaffected by the passage of decades."
    },
    {
      "word": "kindness",
      "hint": "The quality of being friendly, generous, and considerate."
    },
    {
      "word": "darkness",
      "hint": "The total absence of illumination in a room or night landscape."
    },
    {
      "word": "goodness",
      "hint": "The moral virtue of being honest, benevolent, and righteous."
    },
    {
      "word": "softness",
      "hint": "The tactile feeling of a plush velvet pillow or kitten fur."
    },
    {
      "word": "brightness",
      "hint": "The intense radiance and luminosity emitted by a lightbulb."
    },
    {
      "word": "sweetness",
      "hint": "The pleasant sugary flavor quality of ripe strawberries."
    },
    {
      "word": "greatness",
      "hint": "The quality of being eminent, magnificent, or exceptional."
    },
    {
      "word": "fitness",
      "hint": "The state of physical health and athletic stamina."
    },
    {
      "word": "fairness",
      "hint": "Impartial and just treatment without favoritism."
    },
    {
      "word": "sadness",
      "hint": "The emotional feeling of sorrow or unhappiness."
    },
    {
      "word": "stillness",
      "hint": "The complete absence of movement and sound; quiet calm."
    },
    {
      "word": "wilderness",
      "hint": "An uncultivated wild natural landscape untouched by roads."
    },
    {
      "word": "readable",
      "hint": "Clear, legible, and easy to understand when reading."
    },
    {
      "word": "washable",
      "hint": "Capable of being laundered in water without taking damage."
    },
    {
      "word": "breakable",
      "hint": "Delicate and fragile; easily shattered if dropped on tile."
    },
    {
      "word": "believable",
      "hint": "Plausible and convincing enough to accept as truthful."
    },
    {
      "word": "reusable",
      "hint": "Able to be used multiple times, like canvas grocery bags."
    },
    {
      "word": "lovable",
      "hint": "Inspiring deep affection and love; endearing."
    },
    {
      "word": "adorable",
      "hint": "Inspiring warm delight; cute and charming."
    },
    {
      "word": "portable",
      "hint": "Easy to carry around from place to place."
    },
    {
      "word": "foldable",
      "hint": "Designed to be folded flat for compact storage."
    },
    {
      "word": "bendable",
      "hint": "Flexible enough to curve without snapping."
    },
    {
      "word": "teachable",
      "hint": "Willing, curious, and eager to learn new subjects."
    },
    {
      "word": "payment",
      "hint": "The transfer of money in exchange for goods or services."
    },
    {
      "word": "movement",
      "hint": "An act of changing physical location or bodily posture."
    },
    {
      "word": "agreement",
      "hint": "A harmonious consensus or formal treaty reached between parties."
    },
    {
      "word": "statement",
      "hint": "A definite verbal or written declaration of fact or belief."
    },
    {
      "word": "enjoyment",
      "hint": "The state of experiencing pleasure, delight, and fun."
    },
    {
      "word": "excitement",
      "hint": "A feeling of eager enthusiasm and joyful anticipation."
    },
    {
      "word": "treatment",
      "hint": "Medical care provided to help a patient recover quickly."
    },
    {
      "word": "improvement",
      "hint": "The process of getting progressively better at a skill."
    },
    {
      "word": "amusement",
      "hint": "The feeling of being pleasantly entertained or amused."
    },
    {
      "word": "shipment",
      "hint": "A consignment of goods transported together in a truck."
    },
    {
      "word": "settlement",
      "hint": "A community established by pioneers in a new territory."
    },
    {
      "word": "judgment",
      "hint": "The ability to make considered, sensible decisions."
    },
    {
      "word": "quickly",
      "hint": "With rapid speed and swift agility; not slowly."
    },
    {
      "word": "slowly",
      "hint": "At an unhurried, measured pace; with gentle steps."
    },
    {
      "word": "quietly",
      "hint": "Making little or no sound; speaking in a soft whisper."
    },
    {
      "word": "loudly",
      "hint": "With high volume easily heard across a large gymnasium."
    },
    {
      "word": "gracefully",
      "hint": "Moving with elegant poise and natural balance."
    },
    {
      "word": "bravely",
      "hint": "Facing challenges with noble courage and resolve."
    },
    {
      "word": "safely",
      "hint": "In a manner that avoids harm, danger, or injury."
    },
    {
      "word": "neatly",
      "hint": "In a tidy, organized, and orderly fashion."
    },
    {
      "word": "gently",
      "hint": "With tender care and delicate touch."
    },
    {
      "word": "warmly",
      "hint": "In a kind, welcoming, and affectionate manner."
    },
    {
      "word": "happily",
      "hint": "With great joy, cheerful laughter, and contentment."
    },
    {
      "word": "gladly",
      "hint": "With genuine willingness and enthusiastic pleasure."
    },
    {
      "word": "daily",
      "hint": "Occurring or done every single day of the week."
    },
    {
      "word": "softly",
      "hint": "In a quiet, gentle, and peaceful tone."
    },
    {
      "word": "action",
      "hint": "The state of doing something actively."
    },
    {
      "word": "direction",
      "hint": "The course along which someone or something moves."
    },
    {
      "word": "collection",
      "hint": "A curated group of interesting objects gathered over time."
    },
    {
      "word": "celebration",
      "hint": "A joyful social party held to mark a special milestone."
    },
    {
      "word": "education",
      "hint": "The process of acquiring knowledge, skills, and values."
    },
    {
      "word": "protection",
      "hint": "The act of keeping someone safe from harm or danger."
    },
    {
      "word": "election",
      "hint": "A voting process where citizens choose their leaders."
    },
    {
      "word": "invention",
      "hint": "A brand-new useful device designed by an engineer."
    },
    {
      "word": "reflection",
      "hint": "The mirrored image of yourself seen in calm lake water."
    },
    {
      "word": "suggestion",
      "hint": "A helpful idea put forward for consideration."
    },
    {
      "word": "attraction",
      "hint": "A natural drawing force, like a magnet pulling steel."
    },
    {
      "word": "decoration",
      "hint": "An ornament added to make a room festive and cheerful."
    },
    {
      "word": "brightest",
      "hint": "Emitting the most intense light in the night sky."
    },
    {
      "word": "fastest",
      "hint": "Capable of moving at the absolute greatest speed."
    },
    {
      "word": "deepest",
      "hint": "Extending the greatest distance down beneath the surface."
    },
    {
      "word": "strongest",
      "hint": "Having the highest muscular power, durability, or fortitude."
    },
    {
      "word": "cleanest",
      "hint": "Free from any traces of dirt or dust."
    },
    {
      "word": "highest",
      "hint": "Reaching the greatest vertical altitude or peak."
    },
    {
      "word": "oldest",
      "hint": "Having lived or existed for the longest amount of time."
    },
    {
      "word": "quickest",
      "hint": "Taking the least amount of elapsed time to finish."
    },
    {
      "word": "warmest",
      "hint": "Having the most comfortable toasty temperature."
    },
    {
      "word": "coolest",
      "hint": "Having a refreshingly pleasant low temperature."
    },
    {
      "word": "tallest",
      "hint": "Standing greater in height than all others in a grove."
    },
    {
      "word": "childish",
      "hint": "Acting in an immature way typical of a young child."
    },
    {
      "word": "selfish",
      "hint": "Caring only about personal desires without sharing with others."
    },
    {
      "word": "foolish",
      "hint": "Lacking wise judgment; silly and imprudent."
    },
    {
      "word": "stylish",
      "hint": "Fashionable, tasteful, and well-designed in appearance."
    },
    {
      "word": "boyish",
      "hint": "Characteristic of or resembling a youthful boy."
    },
    {
      "word": "girlish",
      "hint": "Characteristic of or resembling a youthful girl."
    },
    {
      "word": "reddish",
      "hint": "Having a slight red tinge in color, like autumn apples."
    },
    {
      "word": "greenish",
      "hint": "Tinged with a hint of green hue."
    },
    {
      "word": "yellowish",
      "hint": "Having a subtle yellow tint."
    },
    {
      "word": "bluish",
      "hint": "Having a slight blue shade, like morning mist."
    },
    {
      "word": "artist",
      "hint": "A creative person who paints, sketches, or sculpts art."
    },
    {
      "word": "scientist",
      "hint": "A researcher who investigates nature and conducts experiments."
    },
    {
      "word": "guitarist",
      "hint": "A musician who plays the acoustic or electric guitar."
    },
    {
      "word": "pianist",
      "hint": "A musician who performs beautiful songs on the piano."
    },
    {
      "word": "finalist",
      "hint": "A competitor who reaches the final championship round."
    },
    {
      "word": "tourist",
      "hint": "A traveler visiting famous landmarks on vacation."
    },
    {
      "word": "chemist",
      "hint": "A scientist who studies molecules, reactions, and elements."
    },
    {
      "word": "dentist",
      "hint": "A healthcare doctor specializing in keeping teeth healthy."
    },
    {
      "word": "florist",
      "hint": "A shopkeeper who arranges and sells colorful bouquets of flowers."
    },
    {
      "word": "soloist",
      "hint": "A musician who performs a musical piece alone onstage."
    },
    {
      "word": "friendship",
      "hint": "A close bond of trust, kindness, and fun between friends."
    },
    {
      "word": "leadership",
      "hint": "The ability to guide, inspire, and organize a team."
    },
    {
      "word": "championship",
      "hint": "A premier tournament contest to crown a champion."
    },
    {
      "word": "partnership",
      "hint": "A cooperative alliance where two people work toward a shared goal."
    },
    {
      "word": "ownership",
      "hint": "The state or legal right of possessing something."
    },
    {
      "word": "membership",
      "hint": "The state of belonging to a club, library, or sports league."
    },
    {
      "word": "fellowship",
      "hint": "Friendly association and camaraderie among people sharing interests."
    },
    {
      "word": "citizenship",
      "hint": "The status of being a recognized, responsible citizen of a nation."
    },
    {
      "word": "dangerous",
      "hint": "Able or likely to cause physical injury or harm."
    },
    {
      "word": "famous",
      "hint": "Widely known and celebrated by populations across the world."
    },
    {
      "word": "courageous",
      "hint": "Possessing bravery and fortitude when facing challenges."
    },
    {
      "word": "marvelous",
      "hint": "Causing intense wonder and delightful admiration."
    },
    {
      "word": "generous",
      "hint": "Freely sharing time, gifts, and kindness with others."
    },
    {
      "word": "furious",
      "hint": "Extremely angry; displaying intense fiery emotion."
    },
    {
      "word": "humorous",
      "hint": "Funny, comical, and provoking happy laughter."
    },
    {
      "word": "nervous",
      "hint": "Feeling mildly anxious before performing in a piano recital."
    },
    {
      "word": "adventurous",
      "hint": "Eager to undertake bold new experiences and exploration."
    },
    {
      "word": "childhood",
      "hint": "The joyful formative period of being a child."
    },
    {
      "word": "neighborhood",
      "hint": "A friendly community district of homes and local parks."
    },
    {
      "word": "brotherhood",
      "hint": "An affectionate bond of friendship and solidarity."
    },
    {
      "word": "sisterhood",
      "hint": "A supportive alliance and fellowship between sisters or friends."
    },
    {
      "word": "parenthood",
      "hint": "The caring role and journey of being a mother or father."
    }
  ],
  "6": [
    {
      "word": "adventure",
      "hint": "An exciting, daring journey into the unknown."
    },
    {
      "word": "curious",
      "hint": "Eager to investigate, learn, and discover new ideas."
    },
    {
      "word": "brilliant",
      "hint": "Exceptionally clever, radiant, or masterfully skilled."
    },
    {
      "word": "enormous",
      "hint": "Extremely large in physical scale, volume, or magnitude."
    },
    {
      "word": "fascinating",
      "hint": "Captivating and intensely engaging to your curiosity."
    },
    {
      "word": "generous",
      "hint": "Willing to give freely of time, kindness, or resources."
    },
    {
      "word": "hilarious",
      "hint": "Extremely humorous and provoking loud, joyful laughter."
    },
    {
      "word": "illuminate",
      "hint": "To brighten with light or clarify an intellectual concept."
    },
    {
      "word": "jeopardy",
      "hint": "A state of danger, hazard, or risk of loss."
    },
    {
      "word": "navigate",
      "hint": "To plot and steer a course safely across sea, land, or air."
    },
    {
      "word": "obstacle",
      "hint": "A physical barrier or conceptual hurdle blocking progress."
    },
    {
      "word": "persuade",
      "hint": "To convince someone to adopt a belief through sound reasoning."
    },
    {
      "word": "sanctuary",
      "hint": "A safe haven or protected wildlife refuge in nature."
    },
    {
      "word": "treacherous",
      "hint": "Hazardously unstable or untrustworthy to travel upon."
    },
    {
      "word": "unanimous",
      "hint": "In complete agreement, with every single person voting in unison."
    },
    {
      "word": "vibrate",
      "hint": "To oscillate rapidly back and forth in rhythmic motion."
    },
    {
      "word": "wilderness",
      "hint": "An uncultivated, wild natural region untouched by roads."
    },
    {
      "word": "yearn",
      "hint": "To feel a profound, heartfelt longing or desire for something."
    },
    {
      "word": "zealous",
      "hint": "Showing passionate fervor and enthusiastic devotion to a cause."
    },
    {
      "word": "analyze",
      "hint": "To examine methodically by breaking complex data into key elements."
    },
    {
      "word": "boundary",
      "hint": "A dividing border line marking the perimeter limit of an area."
    },
    {
      "word": "category",
      "hint": "A distinct division or class of things possessing common traits."
    },
    {
      "word": "diligent",
      "hint": "Working with steady, painstaking, and attentive effort."
    },
    {
      "word": "ecosystem",
      "hint": "A biological community of interacting organisms and their environment."
    },
    {
      "word": "ferocious",
      "hint": "Savagely fierce, aggressive, and powerfully intense."
    },
    {
      "word": "gradual",
      "hint": "Progressing slowly in small successive steps over time."
    },
    {
      "word": "harmony",
      "hint": "A pleasing, peaceful arrangement of parts, notes, or relationships."
    },
    {
      "word": "ingredient",
      "hint": "A component food substance combined to make a recipe."
    },
    {
      "word": "justify",
      "hint": "To prove or demonstrate that an action or conclusion is right."
    },
    {
      "word": "kaleidoscope",
      "hint": "An optical tube creating shifting symmetrical geometric patterns."
    },
    {
      "word": "labyrinth",
      "hint": "An intricate, confusing maze of winding corridors."
    },
    {
      "word": "majestic",
      "hint": "Possessing grandeur, stately beauty, and awe-inspiring dignity."
    },
    {
      "word": "nominate",
      "hint": "To propose formally someone candidacy for an election or honor."
    },
    {
      "word": "observe",
      "hint": "To watch attentively with keen scientific notice."
    },
    {
      "word": "persistent",
      "hint": "Continuing firmly on a path despite hardships or opposition."
    },
    {
      "word": "radiant",
      "hint": "Shining brilliantly with warm, glowing light and joy."
    },
    {
      "word": "stamina",
      "hint": "The physical or mental endurance to sustain prolonged exertion."
    },
    {
      "word": "thrive",
      "hint": "To flourish vigorously and grow healthy and prosperous."
    },
    {
      "word": "unique",
      "hint": "Being the sole one of its kind; distinct and irreplaceable."
    },
    {
      "word": "valid",
      "hint": "Sound, reasonable, and based on solid evidence and logic."
    },
    {
      "word": "evaluate",
      "hint": "To assess and calculate the value, quality, or merit of something."
    },
    {
      "word": "flourish",
      "hint": "To grow luxuriantly and thrive in a favorable environment."
    },
    {
      "word": "gratitude",
      "hint": "A heartfelt feeling of thankfulness and appreciation."
    },
    {
      "word": "horizon",
      "hint": "The distant line where the sky appears to meet the Earth surface."
    },
    {
      "word": "ignite",
      "hint": "To catch fire or spark an energetic reaction."
    },
    {
      "word": "jubilant",
      "hint": "Expressing triumphant, overflowing joy and happiness."
    },
    {
      "word": "keepsake",
      "hint": "A treasured memento retained in memory of a person or place."
    },
    {
      "word": "leverage",
      "hint": "Strategic advantage utilized to multiply practical power."
    },
    {
      "word": "miniature",
      "hint": "Representing something on a much smaller scaled-down version."
    },
    {
      "word": "nomadic",
      "hint": "Roam-living without a fixed permanent home, moving with seasons."
    },
    {
      "word": "originate",
      "hint": "To begin, arise, or spring from a specific historical source."
    },
    {
      "word": "prosper",
      "hint": "To succeed in enterprise and become thriving and secure."
    },
    {
      "word": "quest",
      "hint": "A long, challenging search or adventurous pursuit of a noble goal."
    },
    {
      "word": "reluctant",
      "hint": "Unwilling and hesitant to undertake an action."
    },
    {
      "word": "secluded",
      "hint": "Sheltered from public view; quiet, private, and isolated."
    },
    {
      "word": "triumph",
      "hint": "A grand and glorious victory or notable achievement."
    },
    {
      "word": "ultimate",
      "hint": "Being the final culmination or supreme highest standard."
    },
    {
      "word": "valiant",
      "hint": "Displaying courageous valor and bravery in difficulty."
    },
    {
      "word": "wisdom",
      "hint": "The soundness of action and knowledge gained through experience."
    },
    {
      "word": "zenith",
      "hint": "The highest pinnacle point reached in the celestial sky or career."
    },
    {
      "word": "approximate",
      "hint": "Nearly exact or close in estimate, though not entirely precise."
    },
    {
      "word": "broaden",
      "hint": "To expand the width, scope, or horizons of something."
    },
    {
      "word": "captive",
      "hint": "Held within a protected wildlife reserve enclosure."
    },
    {
      "word": "determine",
      "hint": "To ascertain definitively or resolve a question firmly."
    },
    {
      "word": "emphasize",
      "hint": "To give special prominence or distinct importance to a point."
    },
    {
      "word": "fragment",
      "hint": "A small detached piece broken off from a larger whole."
    },
    {
      "word": "genuine",
      "hint": "Truly what it claims to be; authentic and sincere."
    },
    {
      "word": "hypothesis",
      "hint": "A testable proposed explanation made on preliminary evidence."
    },
    {
      "word": "isolate",
      "hint": "To separate completely from other entities or external influence."
    },
    {
      "word": "milestone",
      "hint": "A significant checkpoint event along a journey or development."
    },
    {
      "word": "nourish",
      "hint": "To provide healthy food and nutrients necessary for growth."
    },
    {
      "word": "peninsula",
      "hint": "A piece of land projecting out into a body of water on three sides."
    },
    {
      "word": "spectator",
      "hint": "A person who watches a sporting game or performance."
    },
    {
      "word": "turbulence",
      "hint": "Violent or unsteady movement of air currents or ocean water."
    },
    {
      "word": "versatile",
      "hint": "Able to adapt readily to many different functions or activities."
    },
    {
      "word": "accurate",
      "hint": "Correct in all details; exact and free from error."
    },
    {
      "word": "adequate",
      "hint": "Satisfactory or acceptable in quality or quantity for a need."
    },
    {
      "word": "ambitious",
      "hint": "Having a strong desire and determination to succeed in life."
    },
    {
      "word": "applause",
      "hint": "Approval or praise expressed by clapping hands at a concert."
    },
    {
      "word": "aquatic",
      "hint": "Living in, growing in, or taking place on the water."
    },
    {
      "word": "assemble",
      "hint": "To fit together the separate component parts of a model kit."
    },
    {
      "word": "astound",
      "hint": "To shock or greatly surprise with remarkable wonder."
    },
    {
      "word": "beverage",
      "hint": "A refreshing drink other than plain water, like fruit punch."
    },
    {
      "word": "burrow",
      "hint": "A cozy underground tunnel dug by a rabbit as a dwelling."
    },
    {
      "word": "calculate",
      "hint": "To determine mathematically using arithmetic operations."
    },
    {
      "word": "canopy",
      "hint": "The high, sheltering leafy roof formed by crowns of forest trees."
    },
    {
      "word": "cascade",
      "hint": "A small waterfall, typically one of several that fall in stages."
    },
    {
      "word": "champion",
      "hint": "A person who has surpassed all rivals in a sporting contest."
    },
    {
      "word": "collide",
      "hint": "To hit with force when moving towards one another."
    },
    {
      "word": "column",
      "hint": "An upright pillar supporting an architectural roof."
    },
    {
      "word": "combine",
      "hint": "To join or merge two or more ingredients into a single unit."
    },
    {
      "word": "commence",
      "hint": "To begin or start a musical concert or sporting event."
    },
    {
      "word": "compose",
      "hint": "To write or create a work of art, music, or poetry."
    },
    {
      "word": "conclude",
      "hint": "To bring something to an end or arrive at a logical judgment."
    },
    {
      "word": "condense",
      "hint": "To change from a gas to a liquid, like dew on morning grass."
    },
    {
      "word": "conquer",
      "hint": "To overcome and take control of a challenging mountain trail."
    },
    {
      "word": "conscious",
      "hint": "Aware of and responding to one surroundings."
    },
    {
      "word": "constant",
      "hint": "Occurring continuously over a period of time; unchanging."
    },
    {
      "word": "contrast",
      "hint": "The state of being strikingly different from something else."
    },
    {
      "word": "crumble",
      "hint": "To break or fall apart into small fragments or crumbs."
    },
    {
      "word": "debate",
      "hint": "A formal discussion on a particular topic in a public meeting."
    },
    {
      "word": "dedicate",
      "hint": "To devote time and effort to a noble cause or project."
    },
    {
      "word": "descend",
      "hint": "To move or fall downwards from a high summit."
    },
    {
      "word": "detect",
      "hint": "To discover or investigate the presence of something."
    },
    {
      "word": "devise",
      "hint": "To plan or invent a complex procedure from scratch."
    },
    {
      "word": "diagonal",
      "hint": "Joining two non-adjacent vertices of a polygon."
    },
    {
      "word": "dignity",
      "hint": "The state or quality of being worthy of honor and respect."
    },
    {
      "word": "display",
      "hint": "To put something in a prominent place for people to view."
    },
    {
      "word": "distinct",
      "hint": "Recognizably different in nature from something else."
    },
    {
      "word": "dominate",
      "hint": "To have a commanding influence on or be the most noticeable."
    },
    {
      "word": "durable",
      "hint": "Able to withstand wear, pressure, or damage over long use."
    },
    {
      "word": "economy",
      "hint": "The wealth and resources of a country or region."
    },
    {
      "word": "elaborate",
      "hint": "Detailed and complicated in design and execution."
    },
    {
      "word": "element",
      "hint": "An essential part or aspect of something abstract."
    },
    {
      "word": "elevate",
      "hint": "To raise or lift something to a higher position."
    },
    {
      "word": "emerge",
      "hint": "To move out of or away from something and become visible."
    },
    {
      "word": "emotion",
      "hint": "A natural instinctive state of mind deriving from feeling."
    },
    {
      "word": "enforce",
      "hint": "To compel observance of or compliance with a law or rule."
    },
    {
      "word": "expand",
      "hint": "To become or make larger or more extensive."
    },
    {
      "word": "explore",
      "hint": "To travel through an unfamiliar area to learn about it."
    },
    {
      "word": "exterior",
      "hint": "The outer surface or structure of a house."
    },
    {
      "word": "fragile",
      "hint": "Easily broken or damaged; delicate."
    },
    {
      "word": "frequent",
      "hint": "Occurring or appearing quite often at short intervals."
    },
    {
      "word": "friction",
      "hint": "The resistance that one surface encounters when moving over another."
    },
    {
      "word": "glimpse",
      "hint": "A momentary or partial view of an animal in a meadow."
    },
    {
      "word": "habitat",
      "hint": "The natural home or environment of an animal or plant."
    },
    {
      "word": "hazard",
      "hint": "A danger or risk that requires caution on a trail."
    },
    {
      "word": "hesitate",
      "hint": "To pause before saying or doing something through caution."
    },
    {
      "word": "humid",
      "hint": "Marked by a relatively high level of water vapor in the air."
    },
    {
      "word": "identity",
      "hint": "The fact of being who or what a person or thing is."
    },
    {
      "word": "immigrant",
      "hint": "A person who comes to live permanently in a new country."
    },
    {
      "word": "impact",
      "hint": "The marked effect or influential impression of an action."
    },
    {
      "word": "impressive",
      "hint": "Evoking admiration through size, quality, or skill."
    },
    {
      "word": "infinite",
      "hint": "Limitless or endless in space, extent, or size."
    },
    {
      "word": "influence",
      "hint": "The capacity to have an effect on the character or behavior."
    },
    {
      "word": "innocent",
      "hint": "Not guilty of a crime or offense; pure."
    },
    {
      "word": "inspect",
      "hint": "To look at someone or something closely to check conditions."
    },
    {
      "word": "inspire",
      "hint": "To fill someone with the urge or ability to do something creative."
    },
    {
      "word": "interior",
      "hint": "The inner part of something; inside."
    },
    {
      "word": "interval",
      "hint": "An intervening time or space between events."
    },
    {
      "word": "invent",
      "hint": "To create or design something that has not existed before."
    },
    {
      "word": "journey",
      "hint": "An act of traveling from one destination to another."
    },
    {
      "word": "jungle",
      "hint": "An area of land overgrown with dense forest and tangled vegetation."
    },
    {
      "word": "legacy",
      "hint": "Something transmitted by or received from an ancestor or predecessor."
    },
    {
      "word": "leisure",
      "hint": "Free time spent enjoying relaxing personal interests."
    },
    {
      "word": "limit",
      "hint": "A point or level beyond which something does not or may not extend."
    },
    {
      "word": "loyalty",
      "hint": "The quality of being faithful and steadfast in allegiance."
    },
    {
      "word": "massive",
      "hint": "Large and heavy or solid; exceptionally bulky."
    },
    {
      "word": "mature",
      "hint": "Fully developed physically and intellectually."
    },
    {
      "word": "maximize",
      "hint": "To make as large or great as possible."
    },
    {
      "word": "meadow",
      "hint": "A piece of grassland, especially one used for hay."
    },
    {
      "word": "melody",
      "hint": "A sequence of single notes that is musically satisfying."
    },
    {
      "word": "mention",
      "hint": "To refer to something briefly and without going into detail."
    },
    {
      "word": "migrant",
      "hint": "An animal that moves from one region to another with seasons."
    },
    {
      "word": "modify",
      "hint": "To make partial or minor changes to something to improve it."
    },
    {
      "word": "monarch",
      "hint": "A sovereign king, queen, or a famous orange migratory butterfly."
    },
    {
      "word": "narrative",
      "hint": "A spoken or written account of connected events; a story."
    },
    {
      "word": "neutral",
      "hint": "Not supporting or helping either side in a conflict."
    },
    {
      "word": "nimble",
      "hint": "Quick and light in movement or action; agile."
    },
    {
      "word": "notable",
      "hint": "Worthy of attention or notice; remarkable."
    },
    {
      "word": "nucleus",
      "hint": "The central and most important part of an object or cell."
    },
    {
      "word": "nurture",
      "hint": "To care for and encourage the healthy growth or development."
    },
    {
      "word": "opponent",
      "hint": "Someone who competes against or fights another in a contest."
    },
    {
      "word": "option",
      "hint": "A thing that is or may be chosen among alternatives."
    },
    {
      "word": "orbit",
      "hint": "The curved path of a celestial object around a star or planet."
    },
    {
      "word": "organic",
      "hint": "Produced without the use of chemical fertilizers or pesticides."
    },
    {
      "word": "origin",
      "hint": "The point or place where something begins or is derived."
    },
    {
      "word": "package",
      "hint": "An object or group of objects wrapped in paper for shipping."
    },
    {
      "word": "parallel",
      "hint": "Side by side and having the same distance continuously between them."
    },
    {
      "word": "passage",
      "hint": "A narrow path, corridor, or section of a written work."
    },
    {
      "word": "pattern",
      "hint": "A repeated decorative design or recurring sequence."
    },
    {
      "word": "penalty",
      "hint": "A punishment imposed for breaking a law, rule, or contract."
    },
    {
      "word": "perform",
      "hint": "To carry out, accomplish, or present a musical show."
    },
    {
      "word": "perimeter",
      "hint": "The continuous line forming the boundary of a closed geometric figure."
    },
    {
      "word": "permit",
      "hint": "To give authorization or consent to someone to do something."
    },
    {
      "word": "petition",
      "hint": "A formal written request signed by many people appeal."
    },
    {
      "word": "pioneer",
      "hint": "A person who is among the first to explore or settle a new country."
    },
    {
      "word": "plateau",
      "hint": "An area of relatively high, flat ground."
    },
    {
      "word": "policy",
      "hint": "A course or principle of action adopted by a government or school."
    },
    {
      "word": "possess",
      "hint": "To have as belonging to one; own."
    },
    {
      "word": "previous",
      "hint": "Existing or occurring before in time or order."
    },
    {
      "word": "primary",
      "hint": "Of chief importance; principal and fundamental."
    },
    {
      "word": "privilege",
      "hint": "A special right, advantage, or immunity granted to a person."
    },
    {
      "word": "proceed",
      "hint": "To begin or continue a course of action."
    },
    {
      "word": "proclaim",
      "hint": "To announce officially or publicly in an open speech."
    },
    {
      "word": "project",
      "hint": "An individual or collaborative enterprise planned to achieve an aim."
    },
    {
      "word": "prompt",
      "hint": "Done without delay; immediate and punctual."
    },
    {
      "word": "propose",
      "hint": "To put forward an idea or plan for consideration by others."
    },
    {
      "word": "pursue",
      "hint": "To follow in order to catch or accomplish an ambition."
    },
    {
      "word": "radiate",
      "hint": "To emit energy, especially light or heat, in the form of rays."
    },
    {
      "word": "recall",
      "hint": "To bring a fact or event back into one mind; remember."
    },
    {
      "word": "refuge",
      "hint": "A condition of being safe or sheltered from pursuit or danger."
    },
    {
      "word": "release",
      "hint": "To allow or enable to escape from confinement; set free."
    },
    {
      "word": "remark",
      "hint": "To say something as a comment; mention."
    },
    {
      "word": "restore",
      "hint": "To bring back to a former condition, place, or position."
    },
    {
      "word": "retreat",
      "hint": "To withdraw to a quiet or secluded place."
    },
    {
      "word": "reveal",
      "hint": "To make previously unknown or secret information known."
    },
    {
      "word": "rhythm",
      "hint": "A strong, regular, repeated pattern of movement or sound."
    },
    {
      "word": "routine",
      "hint": "A sequence of actions regularly followed."
    },
    {
      "word": "rustic",
      "hint": "Relating to the countryside; rural and charmingly simple."
    },
    {
      "word": "sacred",
      "hint": "Connected with religious devotion or dedicated to a noble ideal."
    },
    {
      "word": "scholar",
      "hint": "A specialist in a particular branch of study; a dedicated student."
    },
    {
      "word": "sector",
      "hint": "An area or portion that is distinct from others."
    },
    {
      "word": "sequence",
      "hint": "A particular order in which related events or things follow each other."
    },
    {
      "word": "shelter",
      "hint": "A place giving temporary protection from bad weather."
    },
    {
      "word": "shrine",
      "hint": "A place regarded as holy because of its associations."
    },
    {
      "word": "sketch",
      "hint": "A rough or unfinished drawing or painting."
    },
    {
      "word": "solitary",
      "hint": "Done or existing alone; living in peaceful quiet."
    },
    {
      "word": "source",
      "hint": "A place, person, or thing from which something comes or can be obtained."
    },
    {
      "word": "species",
      "hint": "A group of living organisms consisting of similar individuals."
    },
    {
      "word": "spectrum",
      "hint": "A band of colors, as seen in a rainbow, produced by dispersion of light."
    },
    {
      "word": "specify",
      "hint": "To identify clearly and definitely."
    },
    {
      "word": "sponsor",
      "hint": "An individual or organization that supports an event."
    },
    {
      "word": "strategy",
      "hint": "A plan of action designed to achieve a long-term goal."
    },
    {
      "word": "summit",
      "hint": "The highest point of a hill or mountain."
    },
    {
      "word": "survive",
      "hint": "To continue to live or exist, especially in spite of danger."
    },
    {
      "word": "symbol",
      "hint": "A mark or character used as a conventional representation of an object."
    },
    {
      "word": "symmetry",
      "hint": "The quality of being made up of exactly similar parts facing each other."
    },
    {
      "word": "talent",
      "hint": "Natural aptitude or skill in a musical or athletic field."
    },
    {
      "word": "tactic",
      "hint": "An action or strategy carefully planned to achieve a specific end."
    },
    {
      "word": "territory",
      "hint": "An area of land under the jurisdiction of a ruler or state."
    },
    {
      "word": "texture",
      "hint": "The feel, appearance, or consistency of a surface or substance."
    },
    {
      "word": "theory",
      "hint": "A system of ideas intended to explain something scientific."
    },
    {
      "word": "timeline",
      "hint": "A graphic representation of the passage of time as a line."
    },
    {
      "word": "tolerate",
      "hint": "To allow the existence, occurrence, or practice of without interference."
    },
    {
      "word": "tradition",
      "hint": "The transmission of customs or beliefs from generation to generation."
    },
    {
      "word": "travel",
      "hint": "To go from one place to another, typically over a distance of some length."
    },
    {
      "word": "typical",
      "hint": "Having the distinctive qualities of a particular type of person or thing."
    },
    {
      "word": "undergo",
      "hint": "To experience or be subjected to something."
    },
    {
      "word": "urgent",
      "hint": "Requiring immediate action or attention."
    },
    {
      "word": "vanish",
      "hint": "To disappear suddenly and completely."
    },
    {
      "word": "vehicle",
      "hint": "A thing used for transporting people or goods on land."
    },
    {
      "word": "venture",
      "hint": "A risky or daring journey or undertaking."
    },
    {
      "word": "vertical",
      "hint": "At right angles to the horizontal plane; upright."
    },
    {
      "word": "visible",
      "hint": "Able to be seen with the human eye."
    },
    {
      "word": "voyage",
      "hint": "A long journey involving travel by sea or in space."
    },
    {
      "word": "warrior",
      "hint": "A brave or experienced fighter or character in stories."
    },
    {
      "word": "wealth",
      "hint": "An abundance of valuable possessions or resources."
    },
    {
      "word": "witness",
      "hint": "A person who sees an event, typically a crime or accident, take place."
    },
    {
      "word": "yield",
      "hint": "To produce or provide an agricultural harvest, or give right of way."
    }
  ],
  "7": [
    {
      "word": "imagination",
      "hint": "The mental faculty of forming creative concepts and images."
    },
    {
      "word": "environment",
      "hint": "The surrounding natural ecological conditions where organisms live."
    },
    {
      "word": "magnificent",
      "hint": "Impressively beautiful, grand, elaborate, and majestic."
    },
    {
      "word": "mysterious",
      "hint": "Difficult or impossible to fully explain, understand, or identify."
    },
    {
      "word": "independent",
      "hint": "Free from external control; self-governing and autonomous."
    },
    {
      "word": "extraordinary",
      "hint": "Far beyond what is ordinary, customary, or standard."
    },
    {
      "word": "enthusiastic",
      "hint": "Displaying intense and eager enjoyment, passion, or approval."
    },
    {
      "word": "biodiversity",
      "hint": "The wide variety of plant and animal life across a habitat."
    },
    {
      "word": "chronological",
      "hint": "Arranged in the exact order of time occurrence from first to last."
    },
    {
      "word": "photosynthesis",
      "hint": "The biological synthesis of plant energy using sunlight."
    },
    {
      "word": "architecture",
      "hint": "The science and artistic design of constructing buildings."
    },
    {
      "word": "perseverance",
      "hint": "Tenacious persistence in doing something despite extreme difficulty."
    },
    {
      "word": "unprecedented",
      "hint": "Never before experienced, known, done, or recorded in history."
    },
    {
      "word": "simultaneously",
      "hint": "Occurring, operating, or executed at the exact same instant in time."
    },
    {
      "word": "civilization",
      "hint": "An advanced stage of human social, legal, and cultural development."
    },
    {
      "word": "archaeological",
      "hint": "Pertaining to the scientific excavation and study of ancient human relics."
    },
    {
      "word": "metamorphosis",
      "hint": "A complete structural transformation during insect or amphibian life cycles."
    },
    {
      "word": "telecommunication",
      "hint": "Communication over long distances using cables, satellites, or radio."
    },
    {
      "word": "subterranean",
      "hint": "Existing, situated, or operating entirely beneath the Earth surface."
    },
    {
      "word": "synchronize",
      "hint": "To coordinate watches, gears, or events to operate in perfect unison."
    },
    {
      "word": "perpendicular",
      "hint": "Intersecting at a precise 90-degree right angle."
    },
    {
      "word": "constellation",
      "hint": "A recognizable named configuration of stars in the night sky."
    },
    {
      "word": "circumference",
      "hint": "The continuous perimeter boundary line enclosing a circle."
    },
    {
      "word": "philanthropist",
      "hint": "A benevolent benefactor who donates wealth to humanitarian causes."
    },
    {
      "word": "questionnaire",
      "hint": "A formal set of written questions answered by survey respondents."
    },
    {
      "word": "encyclopedia",
      "hint": "A reference compendium containing comprehensive articles on all topics."
    },
    {
      "word": "pronunciation",
      "hint": "The phonetically correct articulation of spoken words."
    },
    {
      "word": "choreography",
      "hint": "The art of composing and arranging sequence steps in dance."
    },
    {
      "word": "transportation",
      "hint": "The movement of passengers or cargo from one location to another."
    },
    {
      "word": "electromagnetic",
      "hint": "Relating to interlinked electric and magnetic energy fields."
    },
    {
      "word": "cardiovascular",
      "hint": "Relating to the anatomical circulatory system of the heart and blood vessels."
    },
    {
      "word": "philosophical",
      "hint": "Pertaining to deep inquiry into the fundamental nature of reality."
    },
    {
      "word": "infrastructure",
      "hint": "The basic foundational physical systems (roads, bridges, power grids) of a nation."
    },
    {
      "word": "superintendent",
      "hint": "An executive official managing an entire school district or public building."
    },
    {
      "word": "biodegradable",
      "hint": "Capable of being decomposed naturally by bacteria and living organisms."
    },
    {
      "word": "bioluminescence",
      "hint": "The biochemical emission of glowing light by organisms like fireflies."
    },
    {
      "word": "catastrophe",
      "hint": "A sudden, disastrous event causing immense damage or distress."
    },
    {
      "word": "autobiography",
      "hint": "A biographical memoir written by the author about their own life."
    },
    {
      "word": "documentation",
      "hint": "Material that provides official records, proof, or instructional notes."
    },
    {
      "word": "entrepreneurship",
      "hint": "The venture of designing, launching, and managing a new enterprise."
    },
    {
      "word": "fundamentally",
      "hint": "In central relation to the essential foundational core of something."
    },
    {
      "word": "heterogeneous",
      "hint": "Composed of widely diverse, dissimilar parts or ingredients."
    },
    {
      "word": "jurisdiction",
      "hint": "The official legal authority to make judgments and administer law."
    },
    {
      "word": "lexicographer",
      "hint": "A linguistic scholar who writes, compiles, and edits dictionaries."
    },
    {
      "word": "maneuverable",
      "hint": "Capable of being easily steered and guided into narrow spaces."
    },
    {
      "word": "mythological",
      "hint": "Stemming from traditional ancient myths, folklore, and legend."
    },
    {
      "word": "nanotechnology",
      "hint": "The branch of engineering manipulating matter on the atomic scale."
    },
    {
      "word": "oceanography",
      "hint": "The scientific study of marine physical geography and oceanic life."
    },
    {
      "word": "paleontologist",
      "hint": "A scientist who studies fossils to understand prehistoric eras."
    },
    {
      "word": "reconnaissance",
      "hint": "Preliminary exploration to gather tactical geographical intelligence."
    },
    {
      "word": "topographical",
      "hint": "Describing the precise physical contours, elevations, and relief of land."
    },
    {
      "word": "uncharacteristic",
      "hint": "Atypical and not in keeping with someone usual personality."
    },
    {
      "word": "vulnerability",
      "hint": "The state of being susceptible to injury, difficulty, or challenges."
    },
    {
      "word": "weatherproofing",
      "hint": "Treating a structure to resist damage from rain, wind, and freezing frost."
    },
    {
      "word": "crystallization",
      "hint": "The transition of liquid or gas into organized solid mineral crystals."
    },
    {
      "word": "differentiation",
      "hint": "The process of distinguishing between two or more related elements."
    },
    {
      "word": "incomprehensible",
      "hint": "Impossible to mentally grasp or understand."
    },
    {
      "word": "pharmaceutical",
      "hint": "Relating to medicinal compounds and science for healthcare."
    },
    {
      "word": "meteorological",
      "hint": "Pertaining to weather forecasting and atmospheric phenomena."
    },
    {
      "word": "thermoregulation",
      "hint": "The physiological mechanism by which organisms maintain body heat."
    },
    {
      "word": "intercontinental",
      "hint": "Extending, traveling, or operating between multiple global continents."
    },
    {
      "word": "phosphorescence",
      "hint": "Luminescence caused by radiant energy absorption without combustion."
    },
    {
      "word": "thermodynamics",
      "hint": "The branch of physics concerning relationships between heat and energy."
    },
    {
      "word": "hydrodynamics",
      "hint": "The scientific study of fluids in mechanical motion."
    },
    {
      "word": "astrobiology",
      "hint": "The study of the origin, evolution, and search for life in outer space."
    },
    {
      "word": "geomorphology",
      "hint": "The scientific study of the evolution of Earth landforms."
    },
    {
      "word": "interdependence",
      "hint": "The mutually reliant relationship between two or more connected systems."
    },
    {
      "word": "counterbalance",
      "hint": "A weight or influence that balances out an opposing force."
    },
    {
      "word": "rehabilitation",
      "hint": "The process of restoring someone to health through physical therapy."
    },
    {
      "word": "semiconductor",
      "hint": "A solid substance with electrical conductivity between conductor and insulator."
    },
    {
      "word": "characterization",
      "hint": "The literary description and crafting of qualities in a story persona."
    },
    {
      "word": "disillusionment",
      "hint": "A feeling of disappointment resulting from discovering truth."
    },
    {
      "word": "electrochemistry",
      "hint": "The branch of chemistry dealing with electricity and chemical reactions."
    },
    {
      "word": "multidimensional",
      "hint": "Possessing several distinct facets, perspectives, or dimensions."
    },
    {
      "word": "accelerometer",
      "hint": "An instrument for measuring acceleration or vibrations."
    },
    {
      "word": "accomplishment",
      "hint": "Something that has been achieved successfully through effort."
    },
    {
      "word": "administration",
      "hint": "The process or activity of running a school, business, or organization."
    },
    {
      "word": "aeronautical",
      "hint": "Relating to the science or practice of building and flying aircraft."
    },
    {
      "word": "affectionately",
      "hint": "In a way that displays fondness, tender love, or warm regard."
    },
    {
      "word": "agricultural",
      "hint": "Relating to farming, cultivation of the soil, and rearing animals."
    },
    {
      "word": "amphitheater",
      "hint": "An open-air venue used for entertainment, performances, and sports."
    },
    {
      "word": "analytical",
      "hint": "Relating to or using logical analysis or thinking."
    },
    {
      "word": "anthropomorphic",
      "hint": "Attributing human characteristics or behavior to animals or objects."
    },
    {
      "word": "apprehension",
      "hint": "Anxiety or fear that something bad or unpleasant may happen."
    },
    {
      "word": "argumentative",
      "hint": "Given to expressing divergent or opposing views frequently."
    },
    {
      "word": "aristocracy",
      "hint": "The highest class in certain societies, especially holding noble titles."
    },
    {
      "word": "astonishment",
      "hint": "Great surprise or amazement."
    },
    {
      "word": "atmospheric",
      "hint": "Relating to the atmosphere of the Earth or creating an emotional mood."
    },
    {
      "word": "authentication",
      "hint": "The process or action of proving or verifying something as genuine."
    },
    {
      "word": "biocompatible",
      "hint": "Compatible with living tissue or a living system without toxic harm."
    },
    {
      "word": "bioinformatics",
      "hint": "The science of collecting and analyzing complex biological data."
    },
    {
      "word": "brainstorming",
      "hint": "A spontaneous group discussion to produce ideas and solve problems."
    },
    {
      "word": "bureaucratic",
      "hint": "Relating to the business of running an organization with administrative rules."
    },
    {
      "word": "categorization",
      "hint": "The action or process of placing in classes or categories."
    },
    {
      "word": "characteristic",
      "hint": "A feature or quality belonging typically to a person, place, or thing."
    },
    {
      "word": "chromatography",
      "hint": "The separation of chemical mixtures by passing through a medium."
    },
    {
      "word": "circumstellar",
      "hint": "Surrounding or situated around a star in outer space."
    },
    {
      "word": "cinematography",
      "hint": "The art of photography and camerawork in filmmaking."
    },
    {
      "word": "circumstantial",
      "hint": "Pointing indirectly toward someone guilt but not conclusively proving it."
    },
    {
      "word": "clarification",
      "hint": "The action of making a statement less confused and more clearly understood."
    },
    {
      "word": "classification",
      "hint": "The action or process of classifying something according to shared qualities."
    },
    {
      "word": "collaboration",
      "hint": "The action of working with someone to produce or create something together."
    },
    {
      "word": "commemoration",
      "hint": "A ceremony or celebration in which a person or event is remembered."
    },
    {
      "word": "communication",
      "hint": "The imparting or exchanging of information by speaking, writing, or art."
    },
    {
      "word": "compatibility",
      "hint": "A state in which two things are able to exist or occur together without conflict."
    },
    {
      "word": "competitiveness",
      "hint": "Possession of a strong desire to be more successful than others."
    },
    {
      "word": "comprehensive",
      "hint": "Complete and including all or nearly all elements or aspects of something."
    },
    {
      "word": "condensation",
      "hint": "Water that collects as droplets on a cold surface when humid air is in contact."
    },
    {
      "word": "configuration",
      "hint": "An arrangement of elements in a particular form, figure, or combination."
    },
    {
      "word": "congratulations",
      "hint": "Words expressing praise for an achievement or good fortune on a special occasion."
    },
    {
      "word": "connectedness",
      "hint": "The state of being linked or associated with other people or ideas."
    },
    {
      "word": "conservation",
      "hint": "The prevention of wasteful use of a natural resource to protect the wild."
    },
    {
      "word": "consolidation",
      "hint": "The action or process of combining a number of things into a single more effective whole."
    },
    {
      "word": "contamination",
      "hint": "The action or state of making or being made impure by polluting matter."
    },
    {
      "word": "contemporaneous",
      "hint": "Existing or occurring in the same period of time."
    },
    {
      "word": "correspondence",
      "hint": "Communication by exchanging letters or emails."
    },
    {
      "word": "customization",
      "hint": "The action of modifying something to suit a particular individual or task."
    },
    {
      "word": "deceleration",
      "hint": "Reduction in speed or rate; the opposite of acceleration."
    },
    {
      "word": "deforestation",
      "hint": "The action of clearing a wide area of trees."
    },
    {
      "word": "demonstration",
      "hint": "A practical exhibition and explanation of how something works or is performed."
    },
    {
      "word": "dimensionality",
      "hint": "The quality of having dimension or depth in physical or conceptual space."
    },
    {
      "word": "disappointment",
      "hint": "The feeling of sadness or displeasure caused by the nonfulfillment of hopes."
    },
    {
      "word": "discrimination",
      "hint": "The unjust or prejudicial treatment of different categories of people."
    },
    {
      "word": "disenfranchise",
      "hint": "To deprive someone of the legal right to vote."
    },
    {
      "word": "diversification",
      "hint": "The action of making or becoming more diverse or varied."
    },
    {
      "word": "domestication",
      "hint": "The process of taming an animal and keeping it as a pet or on a farm."
    },
    {
      "word": "ecological",
      "hint": "Relating to or concerned with the relation of living organisms to one another."
    },
    {
      "word": "editorial",
      "hint": "Relating to the commissioning or preparing of material for publication."
    },
    {
      "word": "electrochemical",
      "hint": "Relating to chemical reactions involving the transfer of electrons."
    },
    {
      "word": "electrophoresis",
      "hint": "The movement of charged particles in a fluid under the influence of an electric field."
    },
    {
      "word": "environmental",
      "hint": "Relating to the natural world and the impact of human activity on its condition."
    },
    {
      "word": "epidemiological",
      "hint": "Relating to the branch of medicine which deals with the control of diseases."
    },
    {
      "word": "equilibration",
      "hint": "The process of coming into or maintaining a state of balance."
    },
    {
      "word": "evolutionary",
      "hint": "Relating to the gradual development of something, especially living organisms."
    },
    {
      "word": "experimentation",
      "hint": "The process of performing scientific tests to discover new knowledge."
    },
    {
      "word": "generalization",
      "hint": "A general statement or concept obtained by inference from specific cases."
    },
    {
      "word": "granddaughter",
      "hint": "A daughter of someone son or daughter."
    },
    {
      "word": "grandmother",
      "hint": "The mother of one father or mother."
    },
    {
      "word": "grandfather",
      "hint": "The father of one father or mother."
    },
    {
      "word": "grandparents",
      "hint": "The parents of someone father or mother."
    },
    {
      "word": "grandchildren",
      "hint": "The children of someone son or daughter."
    },
    {
      "word": "gubernatorial",
      "hint": "Relating to a state governor or the office of state governor."
    },
    {
      "word": "heartwarming",
      "hint": "Emotionally rewarding, causing feelings of happiness and contentment."
    },
    {
      "word": "identification",
      "hint": "The action or process of identifying someone or something or being identified."
    },
    {
      "word": "illustration",
      "hint": "A picture illustrating a book, newspaper, or educational text."
    },
    {
      "word": "implementation",
      "hint": "The process of putting a decision or plan into effect; execution."
    },
    {
      "word": "inconspicuous",
      "hint": "Not clearly visible or attracting attention; discreet."
    },
    {
      "word": "indistinguishable",
      "hint": "Not able to be identified as different or distinct."
    },
    {
      "word": "individuality",
      "hint": "The quality or character of a particular person or thing that distinguishes them."
    },
    {
      "word": "institutional",
      "hint": "Relating to a large, established organization or foundation."
    },
    {
      "word": "instrumentation",
      "hint": "The apparatus or instruments used in scientific measurement."
    },
    {
      "word": "intellectual",
      "hint": "Relating to the intellect; involving deep thought and reasoning."
    },
    {
      "word": "intentionality",
      "hint": "The fact of being deliberate or done on purpose."
    },
    {
      "word": "interconnected",
      "hint": "Having all constituent parts linked or connected mutually."
    },
    {
      "word": "interpretation",
      "hint": "The action of explaining the meaning of a poem, text, or artwork."
    },
    {
      "word": "interplanetary",
      "hint": "Situated or traveling between planets in the solar system."
    },
    {
      "word": "intersectional",
      "hint": "Relating to interconnected social categorizations."
    },
    {
      "word": "investigation",
      "hint": "The action of investigating something or someone; formal examination."
    },
    {
      "word": "irrepressible",
      "hint": "Not able to be controlled or restrained; full of bubbly energy."
    },
    {
      "word": "kindergarten",
      "hint": "An educational class for children aged five before elementary school."
    },
    {
      "word": "manifestation",
      "hint": "An event, action, or object that clearly shows or embodies something."
    },
    {
      "word": "microcontroller",
      "hint": "A compact integrated circuit designed to govern a specific operation."
    },
    {
      "word": "microorganism",
      "hint": "A microscopic organism, especially a bacterium, virus, or fungus."
    },
    {
      "word": "miniaturization",
      "hint": "The reduction of items to a much smaller scale in electronics."
    },
    {
      "word": "modernization",
      "hint": "The process of adapting something to modern needs or habits."
    },
    {
      "word": "multiplication",
      "hint": "The mathematical process of repeated addition of numbers."
    },
    {
      "word": "multisensory",
      "hint": "Involving or using more than one of the senses simultaneously."
    },
    {
      "word": "navigational",
      "hint": "Relating to the guidance and piloting of a ship, aircraft, or vehicle."
    },
    {
      "word": "neutralization",
      "hint": "The act of rendering something ineffective or harmless."
    },
    {
      "word": "nonjudgmental",
      "hint": "Avoiding moral judgments or harsh criticisms of others."
    },
    {
      "word": "notification",
      "hint": "The action of notifying someone or a formal notice."
    },
    {
      "word": "oceanographer",
      "hint": "A scientist who studies physical and biological aspects of the seas."
    },
    {
      "word": "organizational",
      "hint": "Relating to the structure and coordination of an enterprise."
    },
    {
      "word": "paleontological",
      "hint": "Relating to the branch of science concerned with fossil animals and plants."
    },
    {
      "word": "parliamentarian",
      "hint": "A member of a parliament or an expert in formal meeting rules."
    },
    {
      "word": "personification",
      "hint": "The attribution of a personal nature or human characteristics to something nonhuman."
    },
    {
      "word": "phosphorylation",
      "hint": "A biochemical process that adds a phosphate group to an organic molecule."
    },
    {
      "word": "photoreceptor",
      "hint": "A specialized light-sensitive sensory cell in the retina of the eye."
    },
    {
      "word": "precipitation",
      "hint": "Rain, snow, sleet, or hail that falls to the ground from clouds."
    },
    {
      "word": "proportionality",
      "hint": "The quality of corresponding in size or amount to something else."
    },
    {
      "word": "qualification",
      "hint": "A quality or accomplishment that makes someone suitable for a job."
    },
    {
      "word": "radiocarbon",
      "hint": "A radioactive isotope of carbon used in dating ancient organic materials."
    },
    {
      "word": "reconsideration",
      "hint": "A review of a previous decision, especially with a view to changing it."
    },
    {
      "word": "recreation",
      "hint": "Activity done for enjoyment when one is not working or in school."
    },
    {
      "word": "reinforcement",
      "hint": "The action of strengthening or encouraging a good habit."
    },
    {
      "word": "representation",
      "hint": "The action of speaking or acting on behalf of someone."
    },
    {
      "word": "reproducibility",
      "hint": "The extent to which consistent scientific results are obtained in experiments."
    },
    {
      "word": "responsiveness",
      "hint": "The quality of reacting quickly and positively to inquiries."
    },
    {
      "word": "revolutionize",
      "hint": "To change something radically or fundamentally for the better."
    },
    {
      "word": "safeguarding",
      "hint": "Protecting from harm or damage with proactive measures."
    },
    {
      "word": "simplification",
      "hint": "The process of making something simpler or easier to understand."
    },
    {
      "word": "socioeconomic",
      "hint": "Relating to the interaction of social and economic factors."
    },
    {
      "word": "standardization",
      "hint": "The process of making something conform to a standard or guideline."
    },
    {
      "word": "stratification",
      "hint": "The arrangement or classification of something into different layers."
    },
    {
      "word": "superconductor",
      "hint": "A material that conducts electricity with zero resistance at cold temperatures."
    },
    {
      "word": "sustainability",
      "hint": "The ability to be maintained at a certain rate without depleting natural resources."
    },
    {
      "word": "synchronization",
      "hint": "The operation or activity of two or more things at the same time or rate."
    },
    {
      "word": "technological",
      "hint": "Relating to or using technology in modern engineering."
    },
    {
      "word": "transformation",
      "hint": "A thorough or dramatic change in form, character, or appearance."
    },
    {
      "word": "troubleshooting",
      "hint": "Tracing and solving problems in mechanical or computer systems."
    },
    {
      "word": "unconditional",
      "hint": "Not subject to any conditions; absolute and complete."
    },
    {
      "word": "undergraduate",
      "hint": "A student at a university who has not yet earned a first degree."
    },
    {
      "word": "understanding",
      "hint": "The ability to comprehend something; sympathetic awareness."
    },
    {
      "word": "unidirectional",
      "hint": "Moving or operating in a single direction only."
    },
    {
      "word": "uninhibited",
      "hint": "Expressing one feelings or ideas without restraint."
    },
    {
      "word": "unmistakable",
      "hint": "Not able to be mistaken for anything else; very clear and distinctive."
    },
    {
      "word": "unpredictable",
      "hint": "Not able to be predicted or foreseen; changeful."
    },
    {
      "word": "urbanization",
      "hint": "The process of making an area more urban through community growth."
    },
    {
      "word": "utilitarianism",
      "hint": "The doctrine that actions are right if they are useful for the benefit of all."
    },
    {
      "word": "verification",
      "hint": "The process of establishing the truth, accuracy, or validity of something."
    },
    {
      "word": "waterproofing",
      "hint": "Treating a jacket to resist the ingress of water under specified conditions."
    },
    {
      "word": "weatherization",
      "hint": "Protecting a building from the elements to optimize energy efficiency."
    },
    {
      "word": "biogeography",
      "hint": "The branch of biology dealing with geographical distribution of plants."
    },
    {
      "word": "climatologist",
      "hint": "A scientist who studies long-term climate weather trends and models."
    },
    {
      "word": "crystallography",
      "hint": "The experimental science of determining the atomic structure of crystals."
    },
    {
      "word": "geochronology",
      "hint": "The science of determining the age of rocks, fossils, and sediments."
    },
    {
      "word": "heliocentric",
      "hint": "Having or representing the sun as the center of the solar system."
    },
    {
      "word": "hydrological",
      "hint": "Relating to the properties, distribution, and circulation of water on Earth."
    },
    {
      "word": "immunologist",
      "hint": "A medical scientist specializing in the immune system and wellness."
    },
    {
      "word": "macroeconomics",
      "hint": "The branch of economics concerned with large-scale economic factors."
    },
    {
      "word": "microbiology",
      "hint": "The branch of science dealing with microscopic organisms."
    },
    {
      "word": "neurobiology",
      "hint": "The branch of biology that deals with the physiology of the nervous system."
    },
    {
      "word": "ornithologist",
      "hint": "A zoologist who focuses on the scientific study of birds."
    },
    {
      "word": "photovoltaic",
      "hint": "Relating to the production of electric current at the junction of two substances exposed to light."
    },
    {
      "word": "phytoplankton",
      "hint": "Plankton consisting of microscopic photosynthetic plants drifting in oceans."
    },
    {
      "word": "polytechnical",
      "hint": "Dealing with or providing instruction in many technological subjects."
    },
    {
      "word": "radiotelescope",
      "hint": "An astronomical instrument consisting of a radio receiver and antenna system."
    },
    {
      "word": "seismological",
      "hint": "Relating to the scientific study of earthquakes and earth vibrations."
    },
    {
      "word": "spectroscopy",
      "hint": "The branch of science concerned with the investigation of spectra."
    },
    {
      "word": "stratosphere",
      "hint": "The atmospheric layer above the troposphere extending to about 30 miles."
    },
    {
      "word": "sympathetically",
      "hint": "In a way that shows kindness, concern, and warm sensitivity."
    },
    {
      "word": "telephotograph",
      "hint": "A photograph taken with a telephoto lens showing distant details."
    },
    {
      "word": "volcanological",
      "hint": "Pertaining to the scientific study of volcanoes, magma, and lava."
    },
    {
      "word": "zoogeography",
      "hint": "The geographical distribution of animal species across global regions."
    },
    {
      "word": "counterintuitive",
      "hint": "Contrary to what intuition or initial common sense would expect."
    },
    {
      "word": "disproportionate",
      "hint": "Too large or too small in comparison with something else."
    },
    {
      "word": "inconsequential",
      "hint": "Not important or significant; trivial."
    },
    {
      "word": "indispensability",
      "hint": "The quality of being absolutely necessary and essential."
    },
    {
      "word": "interchangeable",
      "hint": "Apparently identical; able to be exchanged or swapped easily."
    },
    {
      "word": "interdisciplinary",
      "hint": "Relating to more than one branch of knowledge or study."
    },
    {
      "word": "misunderstanding",
      "hint": "A failure to understand something correctly; a minor mixup."
    },
    {
      "word": "oversimplification",
      "hint": "The act of making something so simple that the real facts are distorted."
    },
    {
      "word": "photosensitivity",
      "hint": "Sensitivity or reaction to sunlight or other light sources."
    },
    {
      "word": "unconstitutional",
      "hint": "Not in accordance with the political constitution of a country."
    },
    {
      "word": "unintentional",
      "hint": "Not done on purpose; accidental."
    },
    {
      "word": "unsatisfactory",
      "hint": "Unacceptable or not good enough to meet the expected standard."
    }
  ],
  "8": [
    {
      "word": "phenomenon",
      "hint": "A remarkable observable occurrence or exceptional factual circumstance."
    },
    {
      "word": "meticulous",
      "hint": "Showing intense attention to minute details; painstakingly precise."
    },
    {
      "word": "resilient",
      "hint": "Able to bounce back quickly from hardship, strain, or compression."
    },
    {
      "word": "innovative",
      "hint": "Featuring pioneering new methods; trailblazing and original."
    },
    {
      "word": "perspective",
      "hint": "A particular cognitive stance or vantage point for viewing truth."
    },
    {
      "word": "authentic",
      "hint": "Undisputed in genuineness, verified origin, and true authority."
    },
    {
      "word": "ambiguous",
      "hint": "Open to multiple valid interpretations; having unclear meaning."
    },
    {
      "word": "eloquent",
      "hint": "Fluent, persuasive, and beautifully expressive in speech or writing."
    },
    {
      "word": "serendipity",
      "hint": "The fortunate occurrence of finding valuable things unexpectedly."
    },
    {
      "word": "quintessential",
      "hint": "Representing the most perfect or typical embodiment of a quality."
    },
    {
      "word": "idiosyncratic",
      "hint": "Possessing unique, distinctive quirks specific to an individual."
    },
    {
      "word": "substantiate",
      "hint": "To provide hard evidence to validate and establish the truth of a claim."
    },
    {
      "word": "ubiquitous",
      "hint": "Present, appearing, or found everywhere simultaneously."
    },
    {
      "word": "conscientious",
      "hint": "Governed by inner conscience; painstakingly dedicated and honorable."
    },
    {
      "word": "juxtaposition",
      "hint": "Placing contrasting elements side-by-side to highlight differences."
    },
    {
      "word": "epiphany",
      "hint": "A sudden, profound realization or intuitive flash of deep insight."
    },
    {
      "word": "ephemeral",
      "hint": "Lasting for only a fleeting, brief span of time; transitory."
    },
    {
      "word": "superfluous",
      "hint": "Exceeding what is sufficient or necessary; extra and unneeded."
    },
    {
      "word": "benevolent",
      "hint": "Charitably kind, well-meaning, and showing goodwill toward others."
    },
    {
      "word": "cacophony",
      "hint": "A harsh, jarring, discordant mixture of chaotic sounds."
    },
    {
      "word": "dichotomy",
      "hint": "A sharp division between two opposing or contradictory elements."
    },
    {
      "word": "exacerbate",
      "hint": "To make an existing problem or grievance far worse."
    },
    {
      "word": "formidable",
      "hint": "Inspiring respectful awe or apprehension through sheer skill or power."
    },
    {
      "word": "gregarious",
      "hint": "Fond of social company; extroverted and thriving in groups."
    },
    {
      "word": "hierarchy",
      "hint": "A system ranking members or concepts into graded tiers of status."
    },
    {
      "word": "lugubrious",
      "hint": "Sounding or looking excessively dismal, sorrowful, and mournful."
    },
    {
      "word": "mellifluous",
      "hint": "Sweet-sounding, smooth, and melodious to the ear like flowing honey."
    },
    {
      "word": "nonchalant",
      "hint": "Displaying an effortless air of casual calm unconcern."
    },
    {
      "word": "obsequious",
      "hint": "Excessively eager to please or fawning in servile obedience."
    },
    {
      "word": "paradigm",
      "hint": "A typical archetype framework or fundamental model of understanding."
    },
    {
      "word": "quixotic",
      "hint": "Exceedingly idealistic, unrealistic, and impractical."
    },
    {
      "word": "recalcitrant",
      "hint": "Stubbornly obstinate and actively defying authority or discipline."
    },
    {
      "word": "sagacious",
      "hint": "Possessing keen mental discernment, wisdom, and astute foresight."
    },
    {
      "word": "tenacity",
      "hint": "The quality of gripping a goal firmly with relentless persistence."
    },
    {
      "word": "vicarious",
      "hint": "Experienced in imagination through the feelings or actions of another."
    },
    {
      "word": "whimsical",
      "hint": "Playfully quaint, fanciful, or delightfully unpredictable."
    },
    {
      "word": "xenophile",
      "hint": "An individual who is deeply appreciative of foreign cultures."
    },
    {
      "word": "acquiesce",
      "hint": "To reluctantly accept something without open protest."
    },
    {
      "word": "bellwether",
      "hint": "An indicator or leader that shows the future direction of a trend."
    },
    {
      "word": "circumspect",
      "hint": "Cautious, guarded, and carefully considering all possible consequences."
    },
    {
      "word": "deleterious",
      "hint": "Causing subtle or overt harm and damage over time."
    },
    {
      "word": "egalitarian",
      "hint": "Believing in the fundamental principle of equal rights and justice."
    },
    {
      "word": "fastidious",
      "hint": "Displaying demanding accuracy and particular cleanliness."
    },
    {
      "word": "grandiloquent",
      "hint": "Pompous or bombastic in language intended to impress listeners."
    },
    {
      "word": "hegemony",
      "hint": "Dominant leadership or paramount influence of one group over others."
    },
    {
      "word": "kinetic",
      "hint": "Relating to or resulting from mechanical physical motion and energy."
    },
    {
      "word": "loquacious",
      "hint": "Tending to talk a great deal; extremely articulate and talkative."
    },
    {
      "word": "magnanimous",
      "hint": "Noble-spirited and generous in forgiving an insult or rival."
    },
    {
      "word": "nebulous",
      "hint": "Hazy, indistinct, or cloudlike in form and conceptual clarity."
    },
    {
      "word": "ostentatious",
      "hint": "Designed to attract notice through elaborate, showy display."
    },
    {
      "word": "perspicacious",
      "hint": "Having a ready insight into and deep understanding of things."
    },
    {
      "word": "remuneration",
      "hint": "Financial compensation or reward paid for work or services."
    },
    {
      "word": "sycophant",
      "hint": "A self-seeking flatterer who praises superiors for personal gain."
    },
    {
      "word": "taciturn",
      "hint": "Habitually reserved, quiet, and saying very little in conversation."
    },
    {
      "word": "usurp",
      "hint": "To seize and hold power or position unlawfully through force."
    },
    {
      "word": "verisimilitude",
      "hint": "The appearance or illusion of being authentic and true to reality."
    },
    {
      "word": "aberration",
      "hint": "A departure from what is normal, standard, or expected."
    },
    {
      "word": "capricious",
      "hint": "Given to sudden, unaccountable mood swings or erratic behavior."
    },
    {
      "word": "delineate",
      "hint": "To describe, outline, or portray with precise clarity."
    },
    {
      "word": "fallacious",
      "hint": "Based on a mistaken belief or logically unsound reasoning."
    },
    {
      "word": "harbinger",
      "hint": "A person or event that signals the approach of another."
    },
    {
      "word": "iconoclast",
      "hint": "A person who attacks cherished beliefs or established orthodoxies."
    },
    {
      "word": "judicious",
      "hint": "Having, showing, or done with good sense and prudent judgement."
    },
    {
      "word": "lethargic",
      "hint": "Sluggish, slow, and experiencing a marked lack of energy."
    },
    {
      "word": "munificent",
      "hint": "Larger or more generous than is usual or necessary."
    },
    {
      "word": "nefarious",
      "hint": "Wicked, villainous, and deeply infamous."
    },
    {
      "word": "opulent",
      "hint": "Ostentatiously rich, luxurious, and lavish in scale."
    },
    {
      "word": "panacea",
      "hint": "A universal solution or remedy for all difficulties."
    },
    {
      "word": "querulous",
      "hint": "Habitually complaining in a whining, petulant manner."
    },
    {
      "word": "reticent",
      "hint": "Not revealing one thoughts or feelings readily; reserved."
    },
    {
      "word": "surreptitious",
      "hint": "Kept secret, especially because it would not be approved of."
    },
    {
      "word": "trepidation",
      "hint": "A feeling of fear or agitation about something that may happen."
    },
    {
      "word": "unequivocal",
      "hint": "Leaving no doubt; completely clear and unambiguous."
    },
    {
      "word": "voracious",
      "hint": "Having a huge appetite or exceedingly eager approach to an activity."
    },
    {
      "word": "aesthetic",
      "hint": "Concerned with beauty or the appreciation of artistic beauty."
    },
    {
      "word": "altruistic",
      "hint": "Showing a disinterested and selfless concern for the well-being of others."
    },
    {
      "word": "ameliorate",
      "hint": "To make something bad or unsatisfactory better; improve."
    },
    {
      "word": "anachronism",
      "hint": "A thing belonging or appropriate to a period other than that in which it exists."
    },
    {
      "word": "anomalous",
      "hint": "Deviating from what is standard, normal, or expected."
    },
    {
      "word": "antipathy",
      "hint": "A deep-seated feeling of dislike or aversion."
    },
    {
      "word": "appease",
      "hint": "To pacify or placate someone by acceding to their demands."
    },
    {
      "word": "arcane",
      "hint": "Understood by few; mysterious or secret."
    },
    {
      "word": "archetypal",
      "hint": "Very typical of a certain kind of person or thing."
    },
    {
      "word": "arduous",
      "hint": "Involving or requiring strenuous effort; difficult and tiring."
    },
    {
      "word": "articulate",
      "hint": "Having or showing the ability to speak fluently and coherently."
    },
    {
      "word": "ascetic",
      "hint": "Characterized by the practice of severe self-discipline and abstention."
    },
    {
      "word": "astute",
      "hint": "Having or showing an ability to accurately assess situations and turn this to one advantage."
    },
    {
      "word": "audacious",
      "hint": "Showing a willingness to take surprisingly bold risks."
    },
    {
      "word": "austere",
      "hint": "Severe or strict in manner, attitude, or appearance."
    },
    {
      "word": "autonomy",
      "hint": "The right or condition of self-government."
    },
    {
      "word": "axiom",
      "hint": "A statement or proposition which is regarded as being established and self-evidently true."
    },
    {
      "word": "benign",
      "hint": "Gentle and kindly; not harmful in effect."
    },
    {
      "word": "brazen",
      "hint": "Bold and without shame in behavior."
    },
    {
      "word": "burgeon",
      "hint": "To begin to grow or increase rapidly; flourish."
    },
    {
      "word": "caustic",
      "hint": "Sarcastic in a scathing and bitter way, or burning chemically."
    },
    {
      "word": "censure",
      "hint": "To express severe disapproval of someone or something, especially in a formal statement."
    },
    {
      "word": "clandestine",
      "hint": "Kept secret or done secretively, especially because illicit."
    },
    {
      "word": "coalesce",
      "hint": "To come together to form one mass or whole."
    },
    {
      "word": "cogent",
      "hint": "Clear, logical, and convincing in argument."
    },
    {
      "word": "cognizant",
      "hint": "Having knowledge or being aware of something."
    },
    {
      "word": "commensurate",
      "hint": "Corresponding in size or degree; in proportion."
    },
    {
      "word": "compunction",
      "hint": "A feeling of guilt or moral scruple that prevents or follows the doing of something bad."
    },
    {
      "word": "concise",
      "hint": "Giving a lot of information clearly and in a few words; brief."
    },
    {
      "word": "condescending",
      "hint": "Having or showing a feeling of patronizing superiority."
    },
    {
      "word": "corroborate",
      "hint": "To confirm or give support to a statement, theory, or finding."
    },
    {
      "word": "culpable",
      "hint": "Deserving blame or responsibility for a mistake."
    },
    {
      "word": "dearth",
      "hint": "A scarcity or lack of something."
    },
    {
      "word": "debilitate",
      "hint": "To make someone very weak and infirm."
    },
    {
      "word": "deference",
      "hint": "Humble submission and respect."
    },
    {
      "word": "definitive",
      "hint": "Done or reached decisively and with authority; conclusive."
    },
    {
      "word": "derivative",
      "hint": "Imitative of the work of another artist, and usually disapproved of for that reason."
    },
    {
      "word": "didactic",
      "hint": "Intended to teach, particularly in having moral instruction."
    },
    {
      "word": "diffident",
      "hint": "Modest or shy because of a lack of self-confidence."
    },
    {
      "word": "digress",
      "hint": "To leave the main subject temporarily in speech or writing."
    },
    {
      "word": "disparage",
      "hint": "To regard or represent as being of little worth."
    },
    {
      "word": "disparate",
      "hint": "Essentially different in kind; not allowing comparison."
    },
    {
      "word": "disseminate",
      "hint": "To spread or disperse something, especially information, widely."
    },
    {
      "word": "docile",
      "hint": "Ready to accept control or instruction; submissive."
    },
    {
      "word": "dogmatic",
      "hint": "Inclined to lay down principles as incontrovertibly true."
    },
    {
      "word": "eclectic",
      "hint": "Deriving ideas, style, or taste from a broad and diverse range of sources."
    },
    {
      "word": "efficacy",
      "hint": "The ability to produce a desired or intended result."
    },
    {
      "word": "effervescent",
      "hint": "Giving off bubbles; fizzy, or vivacious and enthusiastic."
    },
    {
      "word": "egregious",
      "hint": "Outstandingly bad; shocking."
    },
    {
      "word": "elucidate",
      "hint": "To make something clear; explain."
    },
    {
      "word": "emulate",
      "hint": "To match or surpass a person or achievement, typically by imitation."
    },
    {
      "word": "enervate",
      "hint": "To cause someone to feel drained of energy or vitality."
    },
    {
      "word": "engender",
      "hint": "To cause or give rise to a feeling, situation, or condition."
    },
    {
      "word": "enigma",
      "hint": "A person or thing that is mysterious, puzzling, or difficult to understand."
    },
    {
      "word": "entrench",
      "hint": "To establish an attitude or habit so firmly that change is difficult."
    },
    {
      "word": "epicurean",
      "hint": "Devoted to the pursuit of sensual pleasure, especially fine food and drink."
    },
    {
      "word": "equivocal",
      "hint": "Open to more than one interpretation; ambiguous."
    },
    {
      "word": "erudite",
      "hint": "Having or showing great knowledge or learning."
    },
    {
      "word": "esoteric",
      "hint": "Intended for or likely to be understood by only a small number of people with specialized knowledge."
    },
    {
      "word": "euphoria",
      "hint": "A feeling or state of intense excitement and happiness."
    },
    {
      "word": "evanescent",
      "hint": "Soon passing out of sight, memory, or existence; quickly fading."
    },
    {
      "word": "exemplary",
      "hint": "Serving as a desirable model; representing the best of its kind."
    },
    {
      "word": "exonerate",
      "hint": "To officially absolve someone from blame for a fault or wrongdoing."
    },
    {
      "word": "expedient",
      "hint": "Convenient and practical, although possibly improper or immoral."
    },
    {
      "word": "expedite",
      "hint": "To make an action or process happen sooner or be accomplished more quickly."
    },
    {
      "word": "explicit",
      "hint": "Stated clearly and in detail, leaving no room for confusion or doubt."
    },
    {
      "word": "extol",
      "hint": "To praise enthusiastically."
    },
    {
      "word": "extraneous",
      "hint": "Irrelevant or unrelated to the subject being dealt with."
    },
    {
      "word": "exuberant",
      "hint": "Filled with or characterized by a lively energy and excitement."
    },
    {
      "word": "facetious",
      "hint": "Treating serious issues with deliberately inappropriate humor; flippant."
    },
    {
      "word": "fallible",
      "hint": "Capable of making mistakes or being wrong."
    },
    {
      "word": "fathom",
      "hint": "To understand a difficult problem after much thought."
    },
    {
      "word": "feasible",
      "hint": "Possible to do easily or conveniently."
    },
    {
      "word": "fervent",
      "hint": "Having or displaying a passionate intensity."
    },
    {
      "word": "fickle",
      "hint": "Changing frequently, especially as regards one loyalties or interests."
    },
    {
      "word": "fluctuate",
      "hint": "To rise and fall irregularly in number or amount."
    },
    {
      "word": "fortuitous",
      "hint": "Happening by accident or chance rather than design; lucky."
    },
    {
      "word": "frugal",
      "hint": "Sparing or economical with regard to money or food."
    },
    {
      "word": "furtive",
      "hint": "Attempting to avoid notice or attention, typically because of guilt."
    },
    {
      "word": "galvanize",
      "hint": "To shock or excite someone into taking action."
    },
    {
      "word": "garrulous",
      "hint": "Excessively talkative, especially on trivial matters."
    },
    {
      "word": "gratuitous",
      "hint": "Uncalled for; lacking good reason; unwarranted."
    },
    {
      "word": "gullible",
      "hint": "Easily persuaded to believe something; credulous."
    },
    {
      "word": "hackneyed",
      "hint": "Lacking significance through having been overused; unoriginal."
    },
    {
      "word": "haughty",
      "hint": "Arrogantly superior and disdainful."
    },
    {
      "word": "hypothetical",
      "hint": "Based on or serving as a hypothesis; supposed but not necessarily true."
    },
    {
      "word": "immutable",
      "hint": "Unchanging over time or unable to be changed."
    },
    {
      "word": "impeccable",
      "hint": "In accordance with the highest standards of propriety; faultless."
    },
    {
      "word": "impervious",
      "hint": "Not allowing fluid to pass through, or unable to be affected by."
    },
    {
      "word": "implacable",
      "hint": "Unable to be placated or appeased; relentless."
    },
    {
      "word": "implicit",
      "hint": "Implied though not plainly expressed."
    },
    {
      "word": "impetuous",
      "hint": "Acting or done quickly and without thought or care."
    },
    {
      "word": "inadvertently",
      "hint": "Without intention; accidentally."
    },
    {
      "word": "incisive",
      "hint": "Intelligently analytical and clear-thinking."
    },
    {
      "word": "incongruous",
      "hint": "Not in harmony or keeping with the surroundings or other aspects."
    },
    {
      "word": "incorrigible",
      "hint": "Not able to be corrected, improved, or reformed."
    },
    {
      "word": "incredulous",
      "hint": "Unwilling or unable to believe something."
    },
    {
      "word": "indifferent",
      "hint": "Having no particular interest or sympathy; unconcerned."
    },
    {
      "word": "indolent",
      "hint": "Wanting to avoid activity or exertion; lazy."
    },
    {
      "word": "inevitable",
      "hint": "Certain to happen; unavoidable."
    },
    {
      "word": "infallible",
      "hint": "Incapable of making mistakes or being wrong."
    },
    {
      "word": "ingenious",
      "hint": "Clever, original, and inventive."
    },
    {
      "word": "inherent",
      "hint": "Existing in something as a permanent, essential, or characteristic attribute."
    },
    {
      "word": "innocuous",
      "hint": "Not harmful or offensive."
    },
    {
      "word": "inscrutable",
      "hint": "Impossible to understand or interpret."
    },
    {
      "word": "insidious",
      "hint": "Proceeding in a gradual, subtle way, but with harmful effects."
    },
    {
      "word": "insipid",
      "hint": "Lacking flavor, vigor, or interest."
    },
    {
      "word": "instigate",
      "hint": "To bring about or initiate an action or event."
    },
    {
      "word": "integral",
      "hint": "Necessary to make a whole complete; essential."
    },
    {
      "word": "intrepid",
      "hint": "Fearless; adventurous."
    },
    {
      "word": "inundate",
      "hint": "To overwhelm someone with things or people to be dealt with."
    },
    {
      "word": "inviolate",
      "hint": "Free or safe from injury or violation."
    },
    {
      "word": "irascible",
      "hint": "Having or showing a tendency to be easily angered."
    },
    {
      "word": "irreproachable",
      "hint": "Beyond criticism; faultless."
    },
    {
      "word": "juxtapose",
      "hint": "To place or deal with close together for contrasting effect."
    },
    {
      "word": "labyrinthine",
      "hint": "Like a labyrinth; irregular and twisting."
    },
    {
      "word": "laconic",
      "hint": "Using very few words in speech."
    },
    {
      "word": "languid",
      "hint": "Displaying or having a disinclination for physical exertion."
    },
    {
      "word": "laudable",
      "hint": "Deserving praise and commendation."
    },
    {
      "word": "levity",
      "hint": "Humor or frivolity, especially the treatment of a serious matter with humor."
    },
    {
      "word": "lucid",
      "hint": "Expressed clearly; easy to understand."
    },
    {
      "word": "luminous",
      "hint": "Full of or shedding light; bright or shining."
    },
    {
      "word": "mandate",
      "hint": "An official order or commission to do something."
    },
    {
      "word": "manifest",
      "hint": "Clear or obvious to the eye or mind."
    },
    {
      "word": "malleable",
      "hint": "Able to be hammered or pressed permanently out of shape without breaking."
    },
    {
      "word": "maverick",
      "hint": "An unorthodox or independent-minded person."
    },
    {
      "word": "mentor",
      "hint": "An experienced and trusted adviser."
    },
    {
      "word": "mercurial",
      "hint": "Subject to sudden or unpredictable changes of mood or mind."
    },
    {
      "word": "minute",
      "hint": "Extremely small in size."
    },
    {
      "word": "mitigate",
      "hint": "To make less severe, serious, or painful."
    },
    {
      "word": "modicum",
      "hint": "A small quantity of a particular thing, especially something considered valuable."
    },
    {
      "word": "mundane",
      "hint": "Lacking interest or excitement; dull."
    },
    {
      "word": "nascent",
      "hint": "Just coming into existence and beginning to display signs of future potential."
    },
    {
      "word": "nuance",
      "hint": "A subtle difference in or shade of meaning, expression, or sound."
    },
    {
      "word": "obdurate",
      "hint": "Stubbornly refusing to change one opinion or course of action."
    },
    {
      "word": "obliterate",
      "hint": "To destroy utterly; wipe out."
    },
    {
      "word": "obscure",
      "hint": "Not discovered or known about; uncertain."
    },
    {
      "word": "obsolete",
      "hint": "No longer produced or used; out of date."
    },
    {
      "word": "officious",
      "hint": "Assertive of authority in an annoyingly domineering way."
    },
    {
      "word": "onerous",
      "hint": "Involving an amount of effort and difficulty that is oppressively burdensome."
    },
    {
      "word": "orthodox",
      "hint": "Conforming to what is generally or traditionally accepted as right or true."
    },
    {
      "word": "palatable",
      "hint": "Pleasant to taste, or acceptable and satisfactory."
    },
    {
      "word": "paradox",
      "hint": "A seemingly absurd or self-contradictory statement that when investigated may prove to be well founded or true."
    },
    {
      "word": "paramount",
      "hint": "More important than anything else; supreme."
    },
    {
      "word": "patronize",
      "hint": "To treat with an apparent kindness that betrays a feeling of superiority."
    },
    {
      "word": "pedagogy",
      "hint": "The method and practice of teaching, especially as an academic subject."
    },
    {
      "word": "pejorative",
      "hint": "Expressing contempt or disapproval."
    },
    {
      "word": "perfunctory",
      "hint": "Carried out with a minimum of effort or reflection."
    },
    {
      "word": "peripheral",
      "hint": "Relating to or situated on the edge or periphery of something."
    },
    {
      "word": "perpetual",
      "hint": "Never ending or changing; occurring repeatedly."
    },
    {
      "word": "pervade",
      "hint": "To spread through and be perceived in every part of."
    },
    {
      "word": "petulant",
      "hint": "Childishly sulky or bad-tempered."
    },
    {
      "word": "phlegmatic",
      "hint": "Having an unemotional and stolidly calm disposition."
    },
    {
      "word": "plausible",
      "hint": "Seeming reasonable or probable."
    },
    {
      "word": "poignant",
      "hint": "Evoking a keen sense of sadness or regret."
    },
    {
      "word": "pragmatic",
      "hint": "Dealing with things sensibly and realistically in a way that is based on practical rather than theoretical considerations."
    },
    {
      "word": "precarious",
      "hint": "Not securely held or in position; dangerously likely to fall or collapse."
    },
    {
      "word": "precocious",
      "hint": "Having developed certain abilities or proclivities at an earlier age than usual."
    },
    {
      "word": "predominant",
      "hint": "Present as the strongest or main element."
    },
    {
      "word": "prerogative",
      "hint": "A right or privilege exclusive to a particular individual or class."
    },
    {
      "word": "prestige",
      "hint": "Widespread respect and admiration felt for someone or something."
    },
    {
      "word": "pristine",
      "hint": "In its original condition; unspoiled."
    },
    {
      "word": "profound",
      "hint": "Very great or intense; having or showing great knowledge or insight."
    },
    {
      "word": "prolific",
      "hint": "Producing much fruit or foliage or many works."
    },
    {
      "word": "propensity",
      "hint": "An inclination or natural tendency to behave in a particular way."
    },
    {
      "word": "proponent",
      "hint": "A person who advocates a theory, proposal, or project."
    },
    {
      "word": "prosaic",
      "hint": "Having the style or diction of prose; lacking poetic beauty."
    },
    {
      "word": "prospective",
      "hint": "Expected or expecting to be something specified in the future."
    },
    {
      "word": "protocol",
      "hint": "The official procedure or system of rules governing affairs of state or diplomatic occasions."
    },
    {
      "word": "provincial",
      "hint": "Of or concerning a province of a country, or regarded as unsophisticated."
    },
    {
      "word": "prudent",
      "hint": "Acting with or showing care and thought for the future."
    },
    {
      "word": "puerile",
      "hint": "Childishly silly and trivial."
    },
    {
      "word": "punctilious",
      "hint": "Showing great attention to detail or correct behavior."
    },
    {
      "word": "pungent",
      "hint": "Having a sharply strong taste or smell."
    },
    {
      "word": "rationalize",
      "hint": "To attempt to explain or justify a behavior or attitude with logical reasons."
    },
    {
      "word": "receptive",
      "hint": "Willing to consider or accept new suggestions and ideas."
    },
    {
      "word": "reciprocate",
      "hint": "To respond to a gesture or action by making a corresponding one."
    },
    {
      "word": "recondite",
      "hint": "Little known; abstruse."
    },
    {
      "word": "redress",
      "hint": "To remedy or set right an unfair situation."
    },
    {
      "word": "redundant",
      "hint": "Not or no longer needed or useful; superfluous."
    },
    {
      "word": "reiterate",
      "hint": "To say something again or a number of times, typically for emphasis or clarity."
    },
    {
      "word": "rejuvenate",
      "hint": "To make someone or something look or feel younger, fresher, or more lively."
    },
    {
      "word": "relinquish",
      "hint": "To voluntarily cease to keep or claim; give up."
    },
    {
      "word": "reminisce",
      "hint": "To indulge in enjoyable recollection of past events."
    },
    {
      "word": "renounce",
      "hint": "To formally declare one abandonment of a claim, right, or possession."
    },
    {
      "word": "replenish",
      "hint": "To fill something up again."
    },
    {
      "word": "replicate",
      "hint": "To make an exact copy of; reproduce."
    },
    {
      "word": "repudiate",
      "hint": "To refuse to accept or be associated with."
    },
    {
      "word": "requisite",
      "hint": "Made necessary by particular circumstances or regulations."
    },
    {
      "word": "rescind",
      "hint": "To revoke, cancel, or repeal a law, order, or agreement."
    },
    {
      "word": "resolute",
      "hint": "Admirably purposeful, determined, and unwavering."
    },
    {
      "word": "resonant",
      "hint": "Deep, clear, and continuing to sound or ring."
    },
    {
      "word": "retrieve",
      "hint": "To get or bring something back from somewhere."
    },
    {
      "word": "reverberate",
      "hint": "To be repeated several times as an echo."
    },
    {
      "word": "revere",
      "hint": "To feel deep respect or admiration for something."
    },
    {
      "word": "rhetoric",
      "hint": "The art of effective or persuasive speaking or writing."
    },
    {
      "word": "rigorous",
      "hint": "Extremely thorough, exhaustive, or accurate."
    },
    {
      "word": "robust",
      "hint": "Strong and healthy; vigorous."
    },
    {
      "word": "rudimentary",
      "hint": "Involving or limited to basic principles."
    },
    {
      "word": "ruminative",
      "hint": "Expressing or manifesting contemplative reflection."
    },
    {
      "word": "salient",
      "hint": "Most noticeable or important."
    },
    {
      "word": "salutary",
      "hint": "Producing good effects; beneficial."
    },
    {
      "word": "sanction",
      "hint": "A threatened penalty for disobeying a law or official permission."
    },
    {
      "word": "sarcasm",
      "hint": "The use of irony to mock or convey contempt."
    },
    {
      "word": "scrutinize",
      "hint": "To examine or inspect closely and thoroughly."
    },
    {
      "word": "sedentary",
      "hint": "Tending to spend much time seated; somewhat inactive."
    },
    {
      "word": "sequential",
      "hint": "Forming or following in a logical sequence."
    },
    {
      "word": "skepticism",
      "hint": "A skeptical attitude; doubt as to the truth of something."
    },
    {
      "word": "solemnity",
      "hint": "The state or quality of being serious and dignified."
    },
    {
      "word": "solicitous",
      "hint": "Characterized by or showing interest or concern."
    },
    {
      "word": "solvent",
      "hint": "Having assets in excess of liabilities; able to pay one debts."
    },
    {
      "word": "sophisticated",
      "hint": "Having, revealing, or proceeding from a great deal of worldly experience and knowledge."
    },
    {
      "word": "sovereign",
      "hint": "Possessing supreme or ultimate power."
    },
    {
      "word": "sparing",
      "hint": "Moderate; economical."
    },
    {
      "word": "specious",
      "hint": "Superficially plausible, but actually wrong."
    },
    {
      "word": "spurious",
      "hint": "Not being what it purports to be; false or fake."
    },
    {
      "word": "squander",
      "hint": "To waste something in a reckless and foolish manner."
    },
    {
      "word": "stagnant",
      "hint": "Having no current or flow and often having an unpleasant smell."
    },
    {
      "word": "staunch",
      "hint": "Loyal and committed in attitude."
    },
    {
      "word": "steadfast",
      "hint": "Resolutely or dutifully firm and unwavering."
    },
    {
      "word": "stimulate",
      "hint": "To raise levels of physiological or nervous activity in."
    },
    {
      "word": "stoic",
      "hint": "A person who can endure pain or hardship without showing their feelings."
    },
    {
      "word": "stratagem",
      "hint": "A plan or scheme, especially one used to outwit an opponent or achieve an end."
    },
    {
      "word": "stringent",
      "hint": "Strict, precise, and exacting."
    },
    {
      "word": "subtle",
      "hint": "So delicate or precise as to be difficult to analyze or describe."
    },
    {
      "word": "succinct",
      "hint": "Briefly and clearly expressed."
    },
    {
      "word": "succulent",
      "hint": "Tender, juicy, and tasty."
    },
    {
      "word": "summon",
      "hint": "To authoritatively or urgently call on someone to be present."
    },
    {
      "word": "supplant",
      "hint": "To supersede and replace."
    },
    {
      "word": "supple",
      "hint": "Bending and moving easily and gracefully; flexible."
    },
    {
      "word": "suppress",
      "hint": "To forcibly put an end to."
    },
    {
      "word": "surfeit",
      "hint": "An excessive amount of something."
    },
    {
      "word": "surrogate",
      "hint": "A substitute, especially a person deputizing for another in a specific role."
    },
    {
      "word": "synthesize",
      "hint": "To combine a number of things into a coherent whole."
    },
    {
      "word": "tabulate",
      "hint": "To arrange data in tabular form."
    },
    {
      "word": "tangible",
      "hint": "Perceptible by touch; clear and definite."
    },
    {
      "word": "tantamount",
      "hint": "Equivalent in seriousness to; virtually the same as."
    },
    {
      "word": "tedious",
      "hint": "Too long, slow, or dull; tiresome or monotonous."
    },
    {
      "word": "temperance",
      "hint": "Abstinence from an excess; moderation or self-restraint."
    },
    {
      "word": "temporal",
      "hint": "Relating to worldly as opposed to spiritual affairs; time-related."
    },
    {
      "word": "tenuous",
      "hint": "Very weak or slight."
    },
    {
      "word": "thorough",
      "hint": "Complete with regard to every detail; not superficial or partial."
    },
    {
      "word": "timbre",
      "hint": "The character or quality of a musical sound or voice."
    },
    {
      "word": "tolerant",
      "hint": "Showing willingness to allow the existence of opinions that one does not necessarily agree with."
    },
    {
      "word": "topography",
      "hint": "The arrangement of the natural and artificial physical features of an area."
    },
    {
      "word": "torpid",
      "hint": "Mentally or physically inactive; lethargic."
    },
    {
      "word": "tractable",
      "hint": "Easy to control or influence."
    },
    {
      "word": "transcendent",
      "hint": "Beyond or above the range of normal or merely physical human experience."
    },
    {
      "word": "transient",
      "hint": "Lasting only for a short time; impermanent."
    },
    {
      "word": "translucent",
      "hint": "Allowing light, but not detailed shapes, to pass through; semitransparent."
    },
    {
      "word": "tremor",
      "hint": "An involuntary quivering movement."
    },
    {
      "word": "trenchant",
      "hint": "Vigorous or incisive in expression or style."
    },
    {
      "word": "trivial",
      "hint": "Of little value or importance."
    },
    {
      "word": "uncanny",
      "hint": "Strange or mysterious, especially in an unsettling way."
    },
    {
      "word": "underscore",
      "hint": "To emphasize or show the importance of something."
    },
    {
      "word": "undermine",
      "hint": "To lessen the effectiveness, power, or ability of."
    },
    {
      "word": "uniform",
      "hint": "Remaining the same in all cases and at all times; unchanging in form or character."
    },
    {
      "word": "unnerve",
      "hint": "To make someone lose courage or confidence."
    },
    {
      "word": "unravel",
      "hint": "To undo twisted, knitted, or woven threads; solve a mystery."
    },
    {
      "word": "unveil",
      "hint": "To remove a veil or covering from, in particular uncover a new monument or work."
    },
    {
      "word": "upheaval",
      "hint": "A violent or sudden change or disruption to something."
    },
    {
      "word": "urbane",
      "hint": "Courteous and refined in manner."
    },
    {
      "word": "vacillate",
      "hint": "To alternate or waver between different opinions or actions."
    },
    {
      "word": "vagary",
      "hint": "An unexpected and inexplicable change in a situation or in someone behavior."
    },
    {
      "word": "validate",
      "hint": "To check or prove the validity or accuracy of."
    },
    {
      "word": "vapid",
      "hint": "Offering nothing that is stimulating or challenging."
    },
    {
      "word": "variegated",
      "hint": "Exhibiting different colors, especially as irregular patches or streaks."
    },
    {
      "word": "venerate",
      "hint": "To regard with great respect; revere."
    },
    {
      "word": "veracity",
      "hint": "Conformity to facts; accuracy and habitual truthfulness."
    },
    {
      "word": "verbose",
      "hint": "Using or expressed in more words than are needed."
    },
    {
      "word": "verdant",
      "hint": "Green with grass or other rich vegetation."
    },
    {
      "word": "verify",
      "hint": "To make sure or demonstrate that something is true, accurate, or justified."
    },
    {
      "word": "veto",
      "hint": "A constitutional right to reject a decision or proposal made by a law-making body."
    },
    {
      "word": "viable",
      "hint": "Capable of working successfully; feasible."
    },
    {
      "word": "vibrancy",
      "hint": "The state of being full of energy and life."
    },
    {
      "word": "vigil",
      "hint": "A period of keeping awake during the time usually spent asleep, especially to keep watch."
    },
    {
      "word": "vigorous",
      "hint": "Strong, healthy, and full of energy."
    },
    {
      "word": "vindicate",
      "hint": "To clear someone of blame or suspicion."
    },
    {
      "word": "vintage",
      "hint": "The year or place in which wine, especially wine of high quality, was produced; classic."
    },
    {
      "word": "viscous",
      "hint": "Having a thick, sticky consistency between solid and liquid."
    },
    {
      "word": "vitality",
      "hint": "The state of being strong and active; energy."
    },
    {
      "word": "volatile",
      "hint": "Liable to change rapidly and unpredictably, especially for the worse."
    },
    {
      "word": "volition",
      "hint": "The faculty or power of using one will."
    },
    {
      "word": "vulnerable",
      "hint": "Susceptible to physical or emotional attack or harm."
    },
    {
      "word": "watershed",
      "hint": "An event or period marking a turning point in a situation."
    },
    {
      "word": "wield",
      "hint": "To hold and use a weapon or tool gracefully."
    },
    {
      "word": "wistful",
      "hint": "Having or showing a feeling of vague or regretful longing."
    },
    {
      "word": "zealot",
      "hint": "A person who is fanatical and uncompromising in pursuit of their ideals."
    }
  ]
};

/**
 * Fisher-Yates array shuffle helper
 */
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Generates a single problem for a target tier.
 * @param {number} targetTier - The curriculum tier (1-8)
 * @param {boolean} isNearThreshold - Whether user is near promotion
 * @param {Set|Array} excludeWords - Words to avoid repeating
 */
export function generateTierProblem(targetTier, isNearThreshold = false, excludeWords = new Set(), specificWordItem = null) {
  let effectiveTier = targetTier;
  const excludeSet = excludeWords instanceof Set ? excludeWords : new Set(excludeWords || []);

  if (specificWordItem) {
    const item = specificWordItem;
    const answer = item.word.toLowerCase();
    return formatWordProblem(item, effectiveTier, answer);
  }

  // Occasionally review lower tiers (15% chance if not near threshold)
  if (!isNearThreshold && targetTier > 1 && Math.random() < 0.15) {
    effectiveTier = Math.floor(Math.random() * (targetTier - 1)) + 1;
  }

  const list = WORD_LISTS[effectiveTier] || WORD_LISTS[1];
  
  // Filter out excluded words if there are sufficient candidates left
  let candidateList = list.filter(item => !excludeSet.has(item.word.toLowerCase()));
  if (candidateList.length === 0) {
    // If current effectiveTier is exhausted, check other tiers before falling back to full list
    for (let t = 1; t <= 8; t++) {
      if (WORD_LISTS[t]) {
        const altCandidates = WORD_LISTS[t].filter(item => !excludeSet.has(item.word.toLowerCase()));
        if (altCandidates.length > 0) {
          candidateList = altCandidates;
          effectiveTier = t;
          break;
        }
      }
    }
  }

  if (candidateList.length === 0) {
    candidateList = list;
  }

  const item = candidateList[Math.floor(Math.random() * candidateList.length)];
  const answer = item.word.toLowerCase();
  return formatWordProblem(item, effectiveTier, answer);
}

/**
 * Calculates the number of letters to reveal for a word based on length, tier, and difficulty.
 * Guarantees that at least 2 letters remain as unrevealed blanks.
 * @param {number} wordLength - Length of the word
 * @param {number} tier - Curriculum tier (1-8)
 * @returns {number} Number of distinct letters to reveal
 */
export function calculateRevealedLetterCount(wordLength, tier = 1) {
  if (wordLength <= 2) return 0;
  if (wordLength === 3) return 1;

  let revealCount = 1;

  if (tier <= 2) {
    // Early phonics / CVC / 4-letter blends
    if (wordLength >= 5) {
      revealCount = 1;
    } else {
      revealCount = 1;
    }
  } else if (tier === 3 || tier === 4) {
    // Elementary digraphs & compound words
    if (wordLength >= 14) {
      revealCount = 5;
    } else if (wordLength >= 11) {
      revealCount = 4;
    } else if (wordLength >= 8) {
      revealCount = 3;
    } else if (wordLength >= 5) {
      revealCount = 2;
    } else {
      revealCount = 1;
    }
  } else if (tier === 5 || tier === 6) {
    // Intermediate prefixes, suffixes & advanced vocabulary
    if (wordLength >= 14) {
      revealCount = 4;
    } else if (wordLength >= 11) {
      revealCount = 3;
    } else if (wordLength >= 8) {
      revealCount = 3;
    } else if (wordLength >= 5) {
      revealCount = 2;
    } else {
      revealCount = 1;
    }
  } else {
    // Tier 7-8: Advanced multisyllabic, etymology & summit rhetoric
    if (wordLength >= 14) {
      revealCount = 4;
    } else if (wordLength >= 11) {
      revealCount = 3;
    } else if (wordLength >= 8) {
      revealCount = 2;
    } else if (wordLength >= 6) {
      revealCount = 2;
    } else {
      revealCount = 1;
    }
  }

  // Safety constraint: Never reveal too many letters; always leave at least 2 blanks
  const maxAllowed = Math.max(1, wordLength - 2);
  return Math.min(revealCount, maxAllowed);
}

/**
 * Selects distinct random indices to reveal in a word.
 * @param {number} length - Word length
 * @param {number} count - Number of indices to select
 * @returns {number[]} Array of sorted indices
 */
function selectRevealedIndices(length, count) {
  if (count <= 0 || length <= count) return [];
  const indices = [];
  const available = Array.from({ length }, (_, i) => i);

  for (let i = 0; i < count && available.length > 0; i++) {
    const randIndex = Math.floor(Math.random() * available.length);
    indices.push(available[randIndex]);
    available.splice(randIndex, 1);
  }

  return indices.sort((a, b) => a - b);
}

function formatWordProblem(item, effectiveTier, answer) {
  const revealCount = calculateRevealedLetterCount(answer.length, effectiveTier);
  const revealedIndices = selectRevealedIndices(answer.length, revealCount);

  const displayString = answer.split('').map((char, index) => {
    return revealedIndices.includes(index) ? char : '_';
  }).join(' ');

  return {
    tier: effectiveTier,
    answer: answer,
    answerString: answer,
    displayString: displayString,
    hint: item.hint,
    type: 'word'
  };
}

/**
 * Generates an expansive batch of deduplicated problems for a session or climb.
 * Guarantees zero word repetition in the returned batch and actively deprioritizes recent history.
 * @param {number} count - Total problems to generate (e.g. 15)
 * @param {number} targetTier - Active tier (1-8)
 * @param {Array|Set} history - Recently encountered words to exclude
 * @param {Set} seenKeys - Keys already in active session
 */
export function generateProblems(count, targetTier, history = [], seenKeys = new Set()) {
  const problems = [];
  const sessionSeen = new Set(seenKeys);
  const recentHistorySet = new Set(Array.isArray(history) ? history.map(w => String(w).toLowerCase()) : []);

  // Combined exclusion set (active session + recent history)
  const masterExclude = new Set([...sessionSeen, ...recentHistorySet]);

  const targetList = WORD_LISTS[targetTier] || WORD_LISTS[1];
  const shuffledTarget = shuffleArray(targetList);

  // 1. First pass: Select fresh words from target tier excluding history & active session
  for (const item of shuffledTarget) {
    if (problems.length >= count) break;
    const w = item.word.toLowerCase();
    if (!masterExclude.has(w)) {
      masterExclude.add(w);
      sessionSeen.add(w);
      seenKeys.add(w);

      const prob = generateTierProblem(targetTier, false, masterExclude, item);
      problems.push({
        ...prob,
        answer: w,
        answerString: w,
        hint: item.hint,
        id: `prob_${Date.now()}_${problems.length}_${Math.random().toString(36).substring(2, 7)}`
      });
    }
  }

  // 2. Second pass: If we still need problems, allow words from target tier not in active session
  if (problems.length < count) {
    for (const item of shuffledTarget) {
      if (problems.length >= count) break;
      const w = item.word.toLowerCase();
      if (!sessionSeen.has(w)) {
        sessionSeen.add(w);
        seenKeys.add(w);

        const prob = generateTierProblem(targetTier, false, sessionSeen, item);
        problems.push({
          ...prob,
          answer: w,
          answerString: w,
          hint: item.hint,
          id: `prob_${Date.now()}_sec_${problems.length}_${Math.random().toString(36).substring(2, 7)}`
        });
      }
    }
  }

  // 3. Third pass: Check adjacent/other curriculum tiers not seen in the active session
  if (problems.length < count) {
    for (let t = 1; t <= 8; t++) {
      if (problems.length >= count) break;
      if (t === targetTier) continue;
      const otherList = shuffleArray(WORD_LISTS[t] || []);
      for (const item of otherList) {
        if (problems.length >= count) break;
        const w = item.word.toLowerCase();
        if (!sessionSeen.has(w)) {
          sessionSeen.add(w);
          seenKeys.add(w);

          const prob = generateTierProblem(t, false, sessionSeen, item);
          problems.push({
            ...prob,
            answer: w,
            answerString: w,
            hint: item.hint,
            id: `prob_${Date.now()}_tier${t}_${problems.length}_${Math.random().toString(36).substring(2, 7)}`
          });
        }
      }
    }
  }

  // 4. Fallback pass (only if entire 1000+ word dictionary was exhausted): generate while updating seen
  while (problems.length < count) {
    const prob = generateTierProblem(targetTier, false, sessionSeen);
    const w = prob.answer.toLowerCase();
    sessionSeen.add(w);
    seenKeys.add(w);
    problems.push({
      ...prob,
      id: `prob_${Date.now()}_fallback_${problems.length}_${Math.random().toString(36).substring(2, 7)}`
    });
  }

  return problems;
}
