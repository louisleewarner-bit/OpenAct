import { emptyTitle, newId, type BuiltinProfileId, type El, type PaperId, type ProfileId, type Script, type SongMeta } from './model';
import { baseId, PROFILES, defaultPaper, profileOf } from './profiles';

// Original sample scripts, written for OpenAct (creative-writing-partner). Safe to ship with the app.

const e = (type: El['type'], text: string, extra: Partial<El> = {}): El => ({ id: newId(), type, text, ...extra });
const song = (title: string, meta: SongMeta): El => e('song', title, { song: meta });

export type SampleId = 'screenplay' | 'panto' | 'musical' | 'blank-screen' | 'blank-stage';

export function makeSample(id: SampleId, paper: PaperId): Script {
  switch (id) {
    case 'screenplay':
      return lastWash(paper);
    case 'panto':
      return jackAndTheBeanstalk(paper);
    case 'musical':
      return lighthouse(paper);
    case 'blank-stage':
      return { title: { ...emptyTitle(), title: 'Untitled play' }, profile: 'stage-uk', paper, elements: [e('act', 'ACT ONE'), e('scene', '')], cast: [], dismissed: [] };
    default:
      return { title: { ...emptyTitle(), title: 'Untitled screenplay' }, profile: 'screenplay', paper, elements: [e('scene', '')], cast: [], dismissed: [] };
  }
}

function lastWash(paper: PaperId): Script {
  return {
    title: { title: 'Last Wash', credit: 'Written by', authors: 'An OpenAct sample script', source: '', draftDate: 'First draft', contact: '' },
    profile: 'screenplay',
    paper,
    cast: [],
    dismissed: [],
    elements: [
      e('scene', 'EXT. HIGH STREET - NIGHT'),
      e('action', 'Rain hammers a row of shuttered shops. One window still glows: SPIN CYCLE LAUNDERETTE, the second N of the sign long dead, a bus shelter opposite with nobody waiting in it.'),
      e('scene', 'INT. SPIN CYCLE LAUNDERETTE - CONTINUOUS'),
      e('action', 'Twelve machines, eleven of them silent. NELL (60s, cardigan, reading glasses on a chain) folds towels into perfect squares and stacks them by colour.'),
      e('action', 'The door bangs open. KASIA (20s, soaked through) staggers in with a bin bag of laundry over one shoulder.'),
      e('character', 'KASIA'),
      e('dialogue', 'Are you still open?'),
      e('character', 'NELL'),
      e('paren', '(without looking up)'),
      e('dialogue', "Sign says ten. Clock says nine fifty-two. You've got eight minutes and a very full bag."),
      e('action', 'Kasia swings the bag onto the counter. It splits. Socks avalanche across the floor.'),
      e('character', 'KASIA'),
      e('dialogue', 'I can explain.'),
      e('character', 'NELL'),
      e('dialogue', "You don't need to explain socks, love. Everyone's got socks."),
      e('action', 'Nell comes round the counter, kneels, and starts pairing them without being asked.'),
      e('character', 'KASIA'),
      e('dialogue', "You don't have to do that."),
      e('character', 'NELL'),
      e('dialogue', 'I know.'),
      e('action', 'She holds up a sock with a hole in the heel, tuts, and tucks it into her cardigan pocket.'),
      e('character', 'NELL'),
      e('dialogue', "My husband used to say you can tell everything about a person from their washing. Wrong, as usual. You can tell everything about a person from what they do when the bag splits. Most people swear. Some people cry. One fella in nineteen ninety-eight walked out and left the lot, and I wore his jumper for twenty years because it was better than anything I owned. You said you can explain. Nobody has ever wanted to explain their socks before."),
      e('character', 'KASIA'),
      e('paren', '(beat)'),
      e('dialogue', "They're not mine."),
      e('action', "Nell stops. Holds up a tiny pink sock. Then a man's black work sock. Then a sock with a cartoon fox on it."),
      e('character', 'NELL'),
      e('dialogue', 'Then whose are they?'),
      e('character', 'KASIA'),
      e('dialogue', "That's the bit I can explain."),
      e('transition', 'SMASH CUT TO:'),
      e('scene', 'INT. SPIN CYCLE LAUNDERETTE - LATER'),
      e('action', 'Machine seven churns. Nell and Kasia sit side by side on the plastic bench, watching it like television.'),
      e('character', 'KASIA'),
      e('dialogue', "Three flats on my landing. Nobody talks to anybody. But they all leave their washing outside my door, because I'm the one who comes here."),
      e('character', 'NELL'),
      e('dialogue', 'And they pay you?'),
      e('character', 'KASIA'),
      e('dialogue', 'They say thank you. Mostly.'),
      e('action', 'The machine shudders into its spin. Nell gets up, turns the sign on the door to CLOSED, and sits back down.'),
      e('character', 'NELL'),
      e('dialogue', 'Right. Tell me about the fox.'),
      e('transition', 'FADE OUT.'),
    ],
  };
}

function jackAndTheBeanstalk(paper: PaperId): Script {
  return {
    title: { title: 'Jack and the Beanstalk', credit: 'A pantomime by', authors: 'An OpenAct sample script', source: '', draftDate: 'Rehearsal draft', contact: '' },
    profile: 'panto',
    paper,
    dismissed: [],
    cast: [
      { name: 'DAME TROTT', description: "Jack's mother. Runs the dairy, and the village." },
      { name: 'JACK', description: 'Our hero. A dreamer with no head for money.' },
      { name: 'SILLY BILLY', description: "Jack's brother and the audience's best friend." },
      { name: 'FLESHCREEP', description: "The Giant's henchman. Boo him." },
      { name: 'FAIRY MOONBEAM', description: 'The good fairy. Speaks in rhyme.' },
    ],
    elements: [
      e('act', 'ACT ONE'),
      e('scene', 'THE VILLAGE OF LITTLE MOO', { sceneType: 'full' }),
      e('action', 'A sunny village green: bunting, a well, and a sign reading LITTLE MOO, TWINNED WITH NOWHERE IN PARTICULAR. The VILLAGERS are mid-dance.'),
      song('MORNING IN LITTLE MOO', { singers: 'VILLAGERS', func: 'Opening number: the village, and its money troubles', staging: 'Full company; DAISY the cow makes a late, hopeful entrance', feel: 'Bright and brassy' }),
      e('scene', 'A LANE OUTSIDE THE VILLAGE', { sceneType: 'cloth' }),
      e('action', 'Tabs in. SILLY BILLY bounds on, waving at everyone.'),
      e('character', 'SILLY BILLY'),
      e('dialogue', 'Hiya, boys and girls!'),
      e('action', 'The audience reply.'),
      e('character', 'SILLY BILLY'),
      e('dialogue', 'Oh, that was rubbish. My nan shouts louder than that, and she lives in Spain. When I say "Hiya, boys and girls", you shout "Hiya, Billy!" Ready? Hiya, boys and girls!'),
      e('action', 'The audience shout back, louder.'),
      e('character', 'SILLY BILLY'),
      e('dialogue', "That's more like it. Now, Mum's sent me to market to sell Daisy the cow. But Daisy's my best friend. So I've got a plan."),
      e('paren', '(Leaning in)'),
      e('dialogue', "I'm going to sell her very, very slowly."),
      e('action', 'DAME TROTT sweeps on in a dress made entirely of tea towels.'),
      e('character', 'DAME TROTT'),
      e('dialogue', 'Billy! Have you sold that cow yet?'),
      e('character', 'SILLY BILLY'),
      e('dialogue', "Not yet, Mum. I've been making friends."),
      e('character', 'DAME TROTT'),
      e('paren', '(To the audience)'),
      e('dialogue', "Ooh, look at you all. Hello, darlings! I'm Dame Trott. I'd shake your hands, but I've just done my nails, and the varnish cost more than the cow.", { note: 'Local gag option: swap the varnish line for the price of parking in town.' }),
      e('action', 'FLESHCREEP slides on behind them, rubbing his hands. The audience boo.'),
      e('character', 'DAME TROTT'),
      e('dialogue', "What's all that booing? Is it the dress?"),
      e('character', 'SILLY BILLY'),
      e('dialogue', "I think there's someone behind us, Mum."),
      e('character', 'DAME TROTT'),
      e('dialogue', "Behind us? Don't be daft."),
      e('paren', '(To the audience)'),
      e('dialogue', 'Is there someone behind us?'),
      e('action', "The audience shout \"He's behind you!\" They turn one way; FLESHCREEP ducks the other. They try again, faster. And again."),
      e('character', 'FLESHCREEP'),
      e('paren', '(Aside)'),
      e('dialogue', 'Enjoy your little lane, peasants. By tonight the Giant will own every cow, every crumb and every tea towel in this village.'),
      e('character', 'DAME TROTT'),
      e('dialogue', 'Did somebody say tea towels?'),
      e('action', 'FLESHCREEP exits with a swirl of his cloak, to boos.'),
      song('SELL HER SLOWLY', { singers: 'SILLY BILLY, DAME TROTT', func: "Comic duet: Billy's plan to keep Daisy", staging: 'Front cloth; DAISY joins for the last chorus', feel: 'Music-hall patter song' }),
      e('lyrics', "We'll sell her slowly, sell her slow,"),
      e('lyrics', 'Down the lane and round we go,'),
      e('lyrics', 'And if a buyer comes our way,'),
      e('lyrics', "We'll take the long way home today!"),
      e('action', 'They exit, with DAISY trotting after. Tabs out.'),
      e('scene', 'THE MARKET SQUARE', { sceneType: 'full' }),
      e('action', 'Stalls, striped awnings and a bustling crowd. FAIRY MOONBEAM enters stage right, as good fairies always do.'),
      e('character', 'FAIRY MOONBEAM'),
      e('dialogue', 'In every tale, however tall, the smallest bean can save us all.'),
      e('scene', "THE GIANT'S KITCHEN", { sceneType: 'full' }),
      e('action', 'A table the size of a bus. A spoon the size of a canoe. FLESHCREEP polishes an enormous fork.'),
    ],
  };
}

function lighthouse(paper: PaperId): Script {
  return {
    title: { title: "The Lighthouse Keeper's Daughter", credit: 'Book and lyrics by', authors: 'An OpenAct sample script', source: '', draftDate: 'Workshop draft', contact: '' },
    profile: 'musical',
    paper,
    dismissed: [],
    cast: [
      { name: 'MAREN', description: "17. The keeper's daughter; a fiddler who has never left the island." },
      { name: 'TOMAS', description: 'Her father, keeper of the Skerry light for thirty years.' },
      { name: 'AGNES', description: "Skipper of the supply boat; an old friend of Maren's mother." },
    ],
    elements: [
      e('act', 'ACT ONE'),
      e('scene', 'THE HARBOUR WALL'),
      e('action', 'Gulls, nets and a supply boat that comes once a week. The ISLANDERS mend, haul and gossip.'),
      song('SALT AND STONE', { singers: 'COMPANY', func: 'Opening number: the island, and the people it keeps', staging: 'Full company on the harbour wall', feel: 'Work song; stamped rhythm' }),
      e('scene', 'THE LAMP ROOM, SKERRY LIGHTHOUSE'),
      e('action', 'Night. The great lens turns slowly overhead. TOMAS trims the wick with a care that has lasted thirty years. MAREN sits on the stair with a letter she keeps folding and unfolding.'),
      e('character', 'TOMAS'),
      e('dialogue', "You've read that letter so many times the ink's going grey."),
      e('character', 'MAREN'),
      e('dialogue', 'They want me in September. A place at the conservatoire. Fees paid.'),
      e('character', 'TOMAS'),
      e('dialogue', "And who keeps the light while you're playing your fiddle in a city?"),
      e('character', 'MAREN'),
      e('dialogue', "You've kept it alone before."),
      e('character', 'TOMAS'),
      e('paren', '(Quietly)'),
      e('dialogue', 'That was the worst year of my life.'),
      e('action', 'He goes out onto the gallery. The beam sweeps past him, out over the dark water. MAREN unfolds the letter one more time.'),
      song('FURTHER THAN THE LIGHT', { singers: 'MAREN', func: '"I want" song: Maren\'s wish to leave the island, and her guilt about it', staging: 'Maren climbs to the gallery rail; the beam sweeps the audience on each chorus', feel: 'Folk ballad; solo fiddle building to full band' }),
      e('lyrics', 'Every night I count the ships'),
      e('lyrics', 'That pass and never stay,'),
      e('lyrics', 'Every night I hold the light'),
      e('lyrics', 'For someone sailing away.'),
      e('lyrics', 'Just once I want to be the one'),
      e('lyrics', 'Who goes into the night,'),
      e('lyrics', 'And finds out what the dark is hiding'),
      e('lyrics', 'Further than the light.'),
      e('action', 'The beam passes. When it comes round again, TOMAS is standing in the doorway. He has heard every word.'),
      e('character', 'TOMAS'),
      e('dialogue', 'Your mother sang that tune. Not those words. But that tune.'),
      e('scene', 'THE JETTY, NEXT MORNING'),
      e('action', 'Grey dawn. AGNES ties up the supply boat: crates of tins and a sack of post.'),
      e('character', 'AGNES'),
      e('dialogue', 'Post for the lighthouse! And something that looks very much like a ticket.'),
      song('FURTHER THAN THE LIGHT (REPRISE)', { singers: 'MAREN, TOMAS', func: 'Placeholder: father and daughter, lyrics to come', staging: '', feel: 'Stripped back; fiddle and voice', reprise: true }),
    ],
  };
}

// ---------------------------------------------------------------------------
// Format templates: the structure each format starts with, plus a few original
// example lines so the layout is visible straight away. Delete the examples and write.


const title = (t: string, credit = 'Written by') => ({ title: t, credit, authors: 'Your name', source: '', draftDate: 'First draft', contact: '' });
const base = (profile: ProfileId, paper: PaperId, t: string, elements: El[], cast: Script['cast'] = []): Script => ({
  title: title(t),
  profile,
  paper,
  elements,
  cast,
  dismissed: [],
});

export function makeTemplate(id: ProfileId): Script {
  if (id.startsWith('custom:')) {
    // An imported format starts from the template of the format it is based on.
    const b = makeTemplate(baseId(id));
    return { ...b, profile: id, paper: profileOf(id).paper ?? b.paper };
  }
  const bid = id as BuiltinProfileId;
  const paper = PROFILES[bid].paper ?? defaultPaper();
  switch (bid) {
    case 'screenplay':
      return base(id, paper, 'Untitled screenplay', [e('scene', ''), e('action', '')]);
    case 'tv-drama':
      return base(id, paper, 'Night Shift', [
        e('act', 'TEASER'),
        e('scene', 'INT. ST AGNES HOSPITAL - A&E - NIGHT'),
        e('action', 'Every cubicle is full. DR PRIYA SHAH (30s) runs on coffee and stubbornness. NURSE OKAFOR (50s) has seen it all twice.'),
        e('character', 'PRIYA'),
        e('dialogue', "Who's next?"),
        e('character', 'NURSE OKAFOR'),
        e('dialogue', "You're not going to like it."),
        e('endAct', 'END OF TEASER'),
        e('act', 'ACT ONE'),
        e('scene', 'INT. ST AGNES HOSPITAL - CORRIDOR - CONTINUOUS'),
        e('action', 'Priya follows Okafor past a row of trolleys. At the end, a man in a wedding suit sits very still.'),
        e('endAct', 'END OF ACT ONE'),
        e('act', 'ACT TWO'),
        e('scene', ''),
        e('endAct', 'END OF ACT TWO'),
        e('act', 'ACT THREE'),
        e('scene', ''),
        e('endAct', 'END OF ACT THREE'),
        e('act', 'ACT FOUR'),
        e('scene', ''),
        e('endAct', 'END OF ACT FOUR'),
        e('act', 'TAG'),
        e('scene', ''),
        e('endAct', 'END OF EPISODE'),
      ]);
    case 'tv-single':
      return base(id, paper, 'Open Plan', [
        e('act', 'COLD OPEN'),
        e('scene', 'INT. BRIGHTWELL INSURANCE - OPEN-PLAN OFFICE - DAY'),
        e('action', 'Forty desks, one working printer. GEMMA (30s) guards it like a nightclub bouncer.'),
        e('character', 'GEMMA'),
        e('dialogue', 'Name and reason for printing.'),
        e('action', 'TOBY (20s) edges up to the desk, holding a single page.'),
        e('character', 'TOBY'),
        e('dialogue', "It's my resignation letter."),
        e('character', 'GEMMA'),
        e('dialogue', "Queue's that way."),
        e('endAct', 'END OF COLD OPEN'),
        e('act', 'ACT ONE'),
        e('scene', ''),
        e('endAct', 'END OF ACT ONE'),
        e('act', 'ACT TWO'),
        e('scene', ''),
        e('endAct', 'END OF ACT TWO'),
        e('act', 'TAG'),
        e('scene', ''),
        e('endAct', 'END OF EPISODE'),
      ]);
    case 'tv-multi':
      return base(id, paper, 'Two Doors Down', [
        e('act', 'ACT ONE'),
        e('scene', "INT. MARGO'S APARTMENT - NIGHT"),
        e('action', 'MARGO IS ON THE SOFA EATING CEREAL OUT OF A MIXING BOWL. THE DOOR OPENS. DEV ENTERS CARRYING A POT PLANT.'),
        e('character', 'DEV'),
        e('dialogue', 'I got you a housewarming present.'),
        e('character', 'MARGO'),
        e('dialogue', "I've lived here six years."),
        e('character', 'DEV'),
        e('dialogue', "Then it's very overdue."),
        e('transition', 'CUT TO:'),
        e('scene', 'INT. HALLWAY - CONTINUOUS'),
        e('action', 'MRS KOWALSKI WAITS OUTSIDE IN A DRESSING GOWN, HOLDING A RECEIPT.'),
        e('character', 'MRS KOWALSKI'),
        e('dialogue', "That's my plant."),
        e('endAct', 'END OF ACT ONE'),
      ]);
    case 'uk-sitcom':
      return base(id, paper, 'Last Orders', [
        e('scene', 'INT. THE CROWN - NIGHT'),
        e('action', 'A QUIET PUB. PAULINE (60S) POLISHES A GLASS THAT IS ALREADY CLEAN. KEV (40S) STARES AT THE QUIZ MACHINE.'),
        e('character', 'KEV'),
        e('dialogue', "What's the capital of Belgium?"),
        e('character', 'PAULINE'),
        e('dialogue', 'B.'),
        e('character', 'KEV'),
        e('dialogue', "That's not funny, Pauline. There's two quid riding on this."),
        e('scene', 'INT. THE CROWN - CELLAR - CONTINUOUS'),
        e('action', 'PAULINE COMES DOWN THE STEPS WITH A TORCH. SOMETHING IN THE DARK SAYS "BRUSSELS".'),
      ]);
    case 'vertical':
      return base(id, paper, 'Wrong Number', [
        e('act', 'The text'),
        e('scene', "INT. LUCY'S BEDROOM - NIGHT"),
        e('action', 'LUCY (20s) is half asleep. Her phone buzzes. Unknown number: "Is it done?"'),
        e('character', 'LUCY'),
        e('paren', '(typing)'),
        e('dialogue', 'Is what done?'),
        e('action', 'Three dots appear. Then disappear.'),
        e('act', 'The photo'),
        e('scene', "INT. LUCY'S BEDROOM - CONTINUOUS"),
        e('action', "The phone buzzes again. A photo: Lucy's own front door, taken from across the street. Tonight."),
      ]);
    case 'stage-uk':
      return base(id, paper, 'Untitled play', [
        e('act', 'ACT ONE'),
        e('scene', 'A KITCHEN. EARLY MORNING.'),
        e('action', 'RUTH, seventies, sits at the table. The kettle is coming to the boil.'),
        e('character', 'RUTH'),
        e('dialogue', "Nobody tells you how loud a kettle is when you're on your own."),
      ], [{ name: 'RUTH', description: 'Seventies. Widowed in the spring.' }]);
    case 'stage-us':
      return base(id, paper, 'Untitled play', [
        e('act', 'ACT ONE'),
        e('scene', 'A KITCHEN. EARLY MORNING.'),
        e('action', 'RUTH, seventies, sits at the table. The kettle is coming to the boil.'),
        e('character', 'RUTH'),
        e('dialogue', "Nobody tells you how loud a kettle is when you're on your own."),
      ], [{ name: 'RUTH', description: 'Seventies. Widowed in the spring.' }]);
    case 'musical':
      return { ...makeSample('musical', paper), title: title('Untitled musical', 'Book and lyrics by'), elements: [
        e('act', 'ACT ONE'),
        e('scene', ''),
        song('OPENING NUMBER', { singers: 'COMPANY', func: 'Opening number: the world of the show', staging: '', feel: '' }),
        e('scene', ''),
        song('"I WANT" SONG', { singers: '', func: "The lead's want, stated in song", staging: '', feel: '' }),
        e('act', 'ACT TWO'),
        song("ENTR'ACTE", { singers: 'ORCHESTRA', func: '', staging: '', feel: '' }),
        e('scene', ''),
        song('FINALE', { singers: 'COMPANY', func: '', staging: '', feel: '' }),
      ], cast: [] };
    case 'musical-us':
      return { ...makeSample('musical', paper), profile: 'musical-us' };
    case 'panto':
      return {
        title: title('Untitled pantomime', 'A pantomime by'),
        profile: id,
        paper,
        dismissed: [],
        cast: [
          { name: 'DAME', description: 'Played by a man, loud frocks, the heart of the show.' },
          { name: 'PRINCIPAL BOY', description: 'The hero, traditionally played by a woman.' },
          { name: 'PRINCIPAL GIRL', description: 'The heroine.' },
          { name: 'COMIC', description: "The audience's friend: runs the call-and-response." },
          { name: 'VILLAIN', description: 'Enters stage left, to boos.' },
          { name: 'GOOD FAIRY', description: 'Enters stage right; speaks in rhyme.' },
          { name: 'CHORUS', description: 'Villagers, courtiers and so on.' },
          { name: 'JUVENILES', description: "The children's chorus." },
        ],
        elements: [
          e('act', 'ACT ONE'),
          e('scene', 'THE VILLAGE', { sceneType: 'full' }),
          song('OPENING NUMBER', { singers: 'COMPANY', func: 'Sets the place, the people and the problem', staging: 'Full company', feel: 'Bright and loud' }),
          e('scene', 'A STREET', { sceneType: 'cloth' }),
          e('action', 'The COMIC makes friends with the audience and sets up the call-and-response.'),
          e('scene', '', { sceneType: 'full' }),
          e('scene', '', { sceneType: 'cloth' }),
          e('scene', 'TRANSFORMATION', { sceneType: 'full' }),
          e('action', 'The Act One finale. The GOOD FAIRY sends our hero on their way.'),
          e('act', 'ACT TWO'),
          e('scene', '', { sceneType: 'full' }),
          e('scene', '', { sceneType: 'cloth' }),
          e('scene', '', { sceneType: 'full' }),
          e('scene', 'SONGSHEET', { sceneType: 'cloth' }),
          song('SONGSHEET', { singers: 'COMIC, AUDIENCE', func: 'Audience sing-along; the sheet flies in', staging: 'In front of the cloth; house lights up', feel: 'Simple and catchy' }),
          e('scene', 'THE WALKDOWN', { sceneType: 'full' }),
          song('WALKDOWN', { singers: 'COMPANY', func: 'Bows in order, ending on a rhyming couplet', staging: 'Full set; walkdown staircase', feel: 'Reprise of the big tune' }),
        ],
      };
    case 'radio-uk':
      return base(id, paper, 'The Lock-Keeper', [
        e('scene', 'EXT. CANAL LOCK. DAWN.'),
        e('sound', 'F/X: WATER THROUGH THE SLUICES. A HERON TAKES OFF.'),
        e('character', 'MAGS'),
        e('paren', '(CALLING)'),
        e('dialogue', "You're late!"),
        e('character', 'TOM'),
        e('paren', '(APPROACHING, OUT OF BREATH)'),
        e('dialogue', 'The swing bridge was stuck. I had to push it.'),
        e('character', 'MAGS'),
        e('dialogue', 'On your own?'),
        e('character', 'TOM'),
        e('dialogue', 'There was a swan helping.'),
        e('sound', 'GRAMS: OPENING MUSIC. HOLD, THEN UNDER.'),
        e('scene', "INT. LOCK-KEEPER'S COTTAGE. CONTINUOUS."),
        e('sound', 'F/X: DOOR. A KETTLE ON A RANGE.'),
      ]);
    case 'audio-us':
      return base(id, paper, 'Dead Air', [
        e('scene', 'INT. WKRL RADIO STATION - NIGHT'),
        e('sound', 'SFX: RAIN AGAINST A WINDOW. A NEEDLE DROPS ON VINYL.'),
        e('character', 'HOST'),
        e('paren', '(into mic)'),
        e('dialogue', "You're listening to the graveyard shift. Lines are open."),
        e('sound', 'SFX: A PHONE LINE CLICKS OPEN.'),
        e('character', 'CALLER (V.O.)'),
        e('paren', '(filtered)'),
        e('dialogue', 'Is this thing on? I need to report a song.'),
        e('sound', 'MUSIC: LOW PIANO STING, THEN UNDER.'),
      ]);
    case 'comic':
      return base(id, paper, 'Moth and Lantern', [
        e('page', ''),
        e('panel', ''),
        e('action', 'Wide. A Victorian rooftop at midnight, in the rain. ADA (12), in a coat three sizes too big, crouches by a chimney stack holding a lantern.'),
        e('caption', 'London, 1889.'),
        e('panel', ''),
        e('action', 'Close on the lantern. A moth the size of a dinner plate lands on the glass.'),
        e('character', 'ADA'),
        e('dialogue', 'Not again.'),
        e('panel', ''),
        e('action', "Ada nose to nose with the moth. Its wings are patterned like a map of the city's rooftops."),
        e('sfx', 'flutta flutta'),
        e('character', 'ADA'),
        e('dialogue', 'Fine. Show me.'),
        e('page', 'Splash'),
        e('panel', ''),
        e('action', 'The moth lifts Ada off the roof by her collar and carries her out over the glittering river.'),
        e('caption', 'Some nights, the city needs a map-reader.'),
      ]);
    case 'game':
      return base(id, paper, 'Salt Road', [
        e('beat', 'Reach the lighthouse before the tide turns'),
        e('scene', 'Harbour gate'),
        e('action', 'Dawn. Fog sits on the water. MARGOT, the harbour keeper, is mending a net and does not look up. Plays when the player first arrives.'),
        e('character', 'MARGOT'),
        e('paren', 'wary'),
        e('dialogue', "You've come down the salt road. Nobody does that any more."),
        e('choice', 'I need to reach the lighthouse.'),
        e('character', 'MARGOT'),
        e('dialogue', 'Then you need the key, and the key is with Tam.'),
        e('cond', 'SET knows_about_key'),
        e('goto', 'Net loft'),
        e('choice', 'Why is the harbour empty?'),
        e('character', 'MARGOT'),
        e('paren', 'quietly'),
        e('dialogue', 'The boats went out after the light went dark. None came back.'),
        e('cond', 'SET knows_boats_lost'),
        e('goto', 'Harbour gate'),
        e('choice', 'Never mind.'),
        e('goto', 'END'),
        e('bark', 'MARGOT: Mind the wet planks.'),
        e('bark', 'MARGOT: Fog is thicker than it was.'),
        e('lore', 'The salt road runs along the bar at low water. It is dry for four hours a day, and not one minute more.'),
        e('scene', 'Net loft'),
        e('action', 'A loft of drying nets. TAM, young and out of breath, hides a brass key behind his back.'),
        e('character', 'TAM'),
        e('paren', 'defensive'),
        e('dialogue', "Margot sent you? She always sends someone. They never come back."),
        e('cond', 'IF knows_boats_lost'),
        e('choice', 'The boats never came back either. I know.'),
        e('character', 'TAM'),
        e('dialogue', 'Then you know why I am scared of that light.'),
        e('cond', 'SET tam_trusts_player'),
        e('goto', 'Lighthouse door'),
        e('choice', 'Give me the key.'),
        e('character', 'TAM'),
        e('dialogue', 'Take it. Please. Just take it.'),
        e('goto', 'Lighthouse door'),
        e('choice', 'I will leave you to it.'),
        e('goto', 'Harbour gate'),
        e('bark', 'TAM: Is somebody there?'),
        e('scene', 'Lighthouse door'),
        e('action', 'The tide is already lapping at the steps. The door is stiff, and the lamp room above is dark.'),
        e('cond', 'IF tam_trusts_player'),
        e('character', 'TAM'),
        e('dialogue', 'I will hold the door. Go on.'),
        e('choice', 'Climb to the lamp room.'),
        e('goto', 'END'),
        e('choice', 'Turn back.'),
        e('goto', 'Net loft'),
      ]);
    case 'treatment':
      return base(id, paper, 'Last Wash: treatment', [
        e('centered', 'LAST WASH'),
        e('scene', 'Logline'),
        e('action', 'On the last night of her launderette, a widow meets a student who does the washing for a whole landing of strangers, and decides the place isn\'t closing after all.'),
        e('scene', 'Synopsis'),
        e('action', "It's ten to ten on a wet night when Kasia staggers into the Spin Cycle with a split bin bag of other people's socks. Nell, who has run the place for thirty-one years and is closing it on Friday, starts pairing them without being asked."),
        e('scene', 'Characters'),
        e('action', 'NELL, 60s. Owner of the Spin Cycle. Tidy, sharp, lonelier than she admits.'),
        e('action', 'KASIA, 20s. Student. Does everyone\'s washing because nobody else will.'),
        e('scene', 'Tone'),
        e('action', 'Warm and funny, with the rhythm of a stage two-hander.'),
      ]);
  }
}
