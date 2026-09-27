/* FriendZone (ASU Edition) — icons and sample data (profiles, events, hangouts, squads) */
/* =========================================================
   Icons
========================================================= */
const I = {
  flame:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5.3 1.8 1.2 2.7 2.2 3 0-3 .3-5.8.8-8.5z"/></svg>',
  cal:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
  users:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.3-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/><circle cx="17" cy="9" r="2.8"/><path d="M16.5 14.6c2.6.1 4.5 1.8 5 4.9"/></svg>',
  search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  chat:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16v11H9l-5 4z"/></svg>',
  user:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4.2 4-6.5 8-6.5s7 2.3 8 6.5"/></svg>',
  x:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  heart:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7.5-4.6-9.5-9.3C1.1 8.3 3.3 4.5 7 4.5c2.1 0 3.6 1.1 5 3 1.4-1.9 2.9-3 5-3 3.7 0 5.9 3.8 4.5 7.2C19.5 16.4 12 21 12 21z"/></svg>',
  star:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2.8 2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z"/></svg>',
  undo:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h11a5 5 0 0 1 0 10h-4"/><path d="m8 5-4 4 4 4"/></svg>',
  plus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  pin:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
  clock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  send:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 3 10 14M21 3l-7 18-4-7-7-4z"/></svg>',
  back:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m15 5-7 7 7 7"/></svg>',
  info:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></svg>',
  spark:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
  shield:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5V6z"/><path d="m9 12 2.2 2.2L15.5 10"/></svg>',
  fork:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3v6a6 6 0 0 0 12 0V3M12 3v18M9 21h6"/></svg>',
  hangout:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8"/></svg>',
  google:'<svg viewBox="0 0 24 24"><path fill="#4285F4" d="M22.5 12.2c0-.8-.1-1.5-.2-2.2H12v4.2h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2.1-1.9 3.2-4.8 3.2-8z"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.7c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.8A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.8 14.2a6.6 6.6 0 0 1 0-4.3V7.1H2.1a11 11 0 0 0 0 9.9z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2A11 11 0 0 0 2.1 7.1l3.7 2.8C6.7 7.3 9.1 5.4 12 5.4z"/></svg>'
};
const SIL = '<svg class="sil" viewBox="0 0 200 200"><circle cx="100" cy="72" r="40" fill="#fff"/><path d="M20 200c4-50 38-78 80-78s76 28 80 78z" fill="#fff"/></svg>';

/* =========================================================
   Reference data
========================================================= */
const MAJORS = [
  ['Computer Systems Engineering','Fulton',1],['Computer Science','Fulton',1],['Software Engineering','Fulton',1],
  ['Electrical Engineering','Fulton',1],['Mechanical Engineering','Fulton',0],['Biomedical Engineering','Fulton',0],
  ['Aerospace Engineering','Fulton',0],['Data Science','The College',1],['Business Analytics','W. P. Carey',1],
  ['Finance','W. P. Carey',0],['Psychology','The College',0],['Biological Sciences','The College',0],
  ['Journalism','Cronkite',0],['Nursing','Edson',0],['Digital Culture','Herberger',1],['Film','Herberger',0],
  ['Sustainability','Global Futures',0]
].map(([n,c,t])=>({n,c,t}));
const majorOf = n => MAJORS.find(m=>m.n===n) || {n,c:'',t:0};
const CAMPUSES = ['Tempe','Downtown Phoenix','Polytechnic','West Valley'];
const SPOTS = ['Memorial Union','Noble Library','Hayden Library','Tooker House','Sun Devil Fitness Complex','ISTB4','Palm Walk','Tempe Town Lake','Mill Avenue','Hassayampa Village','A Mountain (Hayden Butte)','Design North','Taylor Place','Roosevelt Row','Fletcher Library','Polytechnic Academic Center'];
const TAGS = ['Hackathons','Valorant','Boba','LateNightStudy','Coding','RockClimbing','Bouldering','Gym','Hiking','AI','ComputerVision','Accessibility','Robotics','EmbeddedSystems','Anime','GameDev','Photography','Coffee','Basketball','Pickleball','Chess','DigitalArt','Concerts','Running','Yoga','Entrepreneurship','Soccer','Cricket','Film','ThriftShopping','Volunteering','Salsa','Camping','Podcasts','Skateboarding','Sneakers','Journaling','Rocketry','Sports'];
const GOALS = ['Study Buddies','Gym Partners','Gaming Squad','Explore Phoenix','Research Partners','Game Day Crew','Creative Collabs','Startup Builders','Outdoor Adventures','Wellness'];
const PRONOUNS = ['','he/him','she/her','they/them','he/they','she/they','Ask me'];
const CATS = ['Sports','Clubs','Tech','Social','Campus Life'];

const P = (id,name,pref,pron,major,year,campus,hue,likesYou,tags,goals,hangouts,bio)=>({id,name,pref,pron,major,year,campus,hue,likesYou,tags,goals,hangouts,bio});
const PROFILES = [
  P('p1','Priya Raman','Priya','she/her','Computer Science',2029,'Tempe',340,1,['Hackathons','Boba','LateNightStudy','Valorant','AI'],['Study Buddies','Gaming Squad'],['Noble Library','Memorial Union','Hayden Library'],'Sophomore CS, ML club officer. Will trade debugging help for boba. Currently hunting for a Devils Invent team.'),
  P('p2','Marcus Johnson','Marcus','he/him','Mechanical Engineering',2028,'Tempe',18,1,['Bouldering','RockClimbing','Gym','Hiking'],['Gym Partners','Outdoor Adventures'],['Sun Devil Fitness Complex','Tempe Town Lake'],'Climbing wall regular at SDFC. Looking for a belay partner and someone to drag up Camelback before sunrise.'),
  P('p3','Sofia Alvarez','Sofia','she/her','Journalism',2029,'Downtown Phoenix',290,0,['Photography','Coffee','ThriftShopping','Concerts'],['Explore Phoenix','Creative Collabs'],['Taylor Place','Roosevelt Row'],'Cronkite News photographer. I know every coffee shop on Roosevelt Row and I will rank them for you.'),
  P('p4','Ethan Nguyen','Ethan','he/him','Software Engineering',2030,'Polytechnic',205,1,['Valorant','Anime','Coding','LateNightStudy','GameDev'],['Gaming Squad','Study Buddies'],['Polytechnic Academic Center','Memorial Union'],'First-year at Poly. Diamond in Valorant, Iron in sleep schedule. Building a tiny roguelike in Godot.'),
  P('p5','Aisha Bello','Aisha','she/her','Biomedical Engineering',2029,'Tempe',165,1,['Robotics','Accessibility','Hackathons','Running','ComputerVision'],['Research Partners','Study Buddies'],['ISTB4','Noble Library'],'Working on prosthetic grip sensors in a Fulton lab. Want teammates who care about assistive tech.'),
  P('p6','Jake Morrison','Jake','he/him','Finance',2028,'Tempe',32,0,['Pickleball','Gym','Sports','Boba'],['Gym Partners','Game Day Crew'],['Sun Devil Fitness Complex','Memorial Union'],'W. P. Carey junior. Pickleball at 5, student section at 7. Need a tailgate crew for home games.'),
  P('p7','Mei Lin','Mei','she/they','Digital Culture',2030,'Tempe',265,1,['DigitalArt','Anime','Boba','GameDev','Valorant'],['Creative Collabs','Gaming Squad'],['Design North','Memorial Union','Mill Avenue'],'Pixel artist and part-time boba critic. Looking for a programmer to finish a cozy game with.'),
  P('p8','Diego Ramirez','Diego','he/him','Electrical Engineering',2029,'Tempe',150,1,['Robotics','Soccer','Coding','Hiking','EmbeddedSystems'],['Study Buddies','Explore Phoenix'],['ISTB4','Tooker House'],'Tooker alum turned RA. Robotics club PCB guy. Intramural soccer Thursdays, always need subs.'),
  P('p9','Hannah Kim','Hannah','she/her','Psychology',2030,'West Valley',320,0,['Yoga','Journaling','Coffee','Volunteering'],['Study Buddies','Wellness'],['Fletcher Library'],'West Valley first-year. Morning yoga, evening study, and a running list of the best iced lattes in Glendale.'),
  P('p10','Omari Davis','Omari','he/him','Business Analytics',2029,'Tempe',42,1,['Basketball','Sneakers','Entrepreneurship','Podcasts'],['Gym Partners','Startup Builders'],['Sun Devil Fitness Complex','Memorial Union'],'Running a sneaker resale side hustle out of my dorm. Pickup at SDFC most afternoons, come run 3v3.'),
  P('p11','Riya Patel','Riya','she/her','Data Science',2028,'Tempe',355,1,['AI','Chess','Boba','Hackathons','Accessibility'],['Study Buddies','Startup Builders'],['Hayden Library','Noble Library'],'Data science junior. Won two hackathons, lost many chess games. Building an ASL fingerspelling dataset.'),
  P('p12','Noah Fischer','Noah','he/him','Sustainability',2029,'Tempe',110,0,['Hiking','Camping','Bouldering','Photography'],['Outdoor Adventures','Explore Phoenix'],['Tempe Town Lake','A Mountain (Hayden Butte)','Palm Walk'],'Weekend trips to Sedona and Flagstaff. I own too many carabiners and a car with four open seats.'),
  P('p13','Camila Reyes','Camila','she/her','Nursing',2030,'Downtown Phoenix',5,1,['Salsa','Running','Coffee','Volunteering'],['Wellness','Explore Phoenix'],['Taylor Place','Roosevelt Row'],'Edson nursing first-year. Salsa on Thursdays, 5K on Saturdays. Show me your favorite taco spot.'),
  P('p14','Arjun Mehta','Arjun','he/him','Computer Systems Engineering',2030,'Tempe',225,1,['Valorant','Hackathons','Cricket','EmbeddedSystems','LateNightStudy','Coding'],['Gaming Squad','Study Buddies'],['Tooker House','Noble Library'],'CSE first-year in Tooker. Soldering, Valorant, and cricket on the Hassayampa lawn. Always down for a 2 a.m. debug.'),
  P('p15','Grace Okafor','Grace','she/her','Aerospace Engineering',2029,'Polytechnic',190,0,['Robotics','RockClimbing','Rocketry','Coding'],['Research Partners','Gym Partners'],['Polytechnic Academic Center'],'Poly aerospace. Our rocketry team needs an avionics person. I also climb, badly but enthusiastically.'),
  P('p16','Tyler Brooks','Tyler','he/him','Film',2028,'Tempe',15,1,['Film','Concerts','Skateboarding','Photography'],['Creative Collabs','Explore Phoenix'],['Mill Avenue','Memorial Union'],'Herberger film junior shooting a short about Tempe at night. Need actors, crew, and people who like diner food.')
];
const byId = id => PROFILES.find(p=>p.id===id);

const E = (id,title,cat,when,loc,campus,tags,att,desc,extra={})=>({id,title,cat,when,loc,campus,tags,att,desc,...extra});
const EVENTS = [
  E('e1','Devils Invent: Accessibility Hackathon','Tech','2026-10-03T09:00','ISTB4','Tempe',['Hackathons','Accessibility','Coding','AI','ComputerVision'],['p1','p5','p11','p14','p8'],'24-hour build sprint on assistive tech. Teams of 2 to 4, mentors from Fulton labs, prizes for most usable prototype.'),
  E('e2','GDSC Workshop: On-Device ML','Tech','2026-09-29T18:00','Noble Library, Room 108','Tempe',['AI','ComputerVision','Coding'],['p1','p11','p14','p4'],'Hands-on session: shrink a vision model and run it on a phone. Bring a laptop.'),
  E('e3','Sun Devil Football Watch Party','Sports','2026-10-03T19:00','Memorial Union, Pima Room','Tempe',['Sports','Boba'],['p6','p10','p2','p16'],'Big screen, free snacks, maroon and gold required. Hosted by Programming Activities Board.'),
  E('e4','Sunrise Hike up A Mountain','Campus Life','2026-10-04T06:00','A Mountain (Hayden Butte) trailhead','Tempe',['Hiking','Photography','Running'],['p12','p2','p8'],'Meet at the trailhead, catch sunrise over Tempe, breakfast burritos after.'),
  E('e5','Bouldering Night','Sports','2026-09-30T19:00','Sun Devil Fitness Complex climbing wall','Tempe',['Bouldering','RockClimbing','Gym'],['p2','p12','p15'],'Beginner-friendly route setting and shoe rentals included with your SDFC access.'),
  E('e6','Valorant Campus Cup','Clubs','2026-10-02T20:00','Memorial Union Gaming Lounge','Tempe',['Valorant','GameDev','Anime'],['p4','p7','p14','p1'],'5v5 bracket run by ASU Esports. Solo sign-ups get placed on a team.'),
  E('e7','Boba & Board Games','Social','2026-10-01T19:00','Tooker House Lounge','Tempe',['Boba','Chess','Anime'],['p7','p11','p14','p6'],'Free boba for the first 60, Catan and chess tables, low-key vibes.'),
  E('e8','Fulton Career & Internship Fair','Tech','2026-10-06T10:00','Memorial Union Ballrooms','Tempe',['Coding','Entrepreneurship','Robotics'],['p5','p8','p10','p11','p14','p15'],'Over 100 employers hiring for internships and co-ops. Resume review booth open all day.'),
  E('e9','First Friday Art Walk','Social','2026-10-02T18:00','Roosevelt Row','Downtown Phoenix',['DigitalArt','Photography','Concerts'],['p3','p7','p13','p16'],'Galleries, murals and street food. Group leaves from Taylor Place at 6.'),
  E('e10','Venture Devils Pitch Night','Clubs','2026-10-07T18:00','SkySong Innovation Center','Tempe',['Entrepreneurship','Podcasts','AI'],['p10','p11','p6'],'Student founders pitch in three minutes. Audience votes for the seed prize.'),
  E('e11','Pickleball Open Play','Sports','2026-09-28T17:00','Sun Devil Fitness Complex courts','Tempe',['Pickleball','Sports'],['p6','p10'],'Paddles provided. Rotating doubles, all levels.'),
  E('e12','Robotics Club Build Night','Clubs','2026-10-01T19:00','ISTB4 Makerspace','Tempe',['Robotics','EmbeddedSystems','Coding'],['p5','p8','p15','p14'],'Soldering stations, parts library, and seniors who will explain your motor driver.'),
  E('e13','Midterm Late Night Study Jam','Campus Life','2026-09-28T21:00','Hayden Library, Level 2','Tempe',['LateNightStudy','Coffee'],['p1','p11','p14'],'Quiet floor, free coffee until midnight, tutors for math and physics.'),
  E('e14','Yoga on the Lawn','Campus Life','2026-09-29T07:30','Fletcher Library lawn','West Valley',['Yoga','Journaling'],['p9','p13'],'Mats provided. 45-minute flow before class.'),
  E('e15','Salsa Night at Taylor Place','Social','2026-10-01T20:00','Taylor Place courtyard','Downtown Phoenix',['Salsa','Concerts'],['p13','p3'],'Free lesson at 8, open dancing until 10.')
];
const HANGOUTS0 = [
  E('h1','3v3 Basketball at SDFC','Sports','2026-09-27T17:00','Sun Devil Fitness Complex','Tempe',['Basketball','Gym','Sports'],['p10','p6','p2'],'Running full-court if we get 6. Bring water.',{host:'p10',cap:6,hang:1}),
  E('h2','Late night study session at Noble','Campus Life','2026-09-28T21:30','Noble Library','Tempe',['LateNightStudy','Coding'],['p1','p14'],'Big table by the windows. MAT 265 and CSE homework welcome.',{host:'p1',cap:8,hang:1}),
  E('h3','Boba run to Mill Ave','Social','2026-09-29T16:00','Mill Avenue','Tempe',['Boba'],['p7','p11'],'Walking over from the MU after class.',{host:'p7',cap:5,hang:1}),
  E('h4','Tempe Town Lake sunset walk','Campus Life','2026-09-30T18:15','Tempe Town Lake','Tempe',['Hiking','Photography'],['p12','p2'],'Easy loop, good light for photos.',{host:'p12',cap:10,hang:1})
];

const S = (id,name,desc,tags,campus,members,events,hue,chat)=>({id,name,desc,tags,campus,members,events,hue,chat});
const SQUADS0 = [
  S('s1','Tempe Gamers','Valorant stacks, Smash Fridays, and whoever is still up at 1 a.m.',['Valorant','GameDev','Anime'],'Tempe',['p4','p7','p14','p1','p16'],['e6','e7'],265,[['p7','Customs lobby tonight at 10?'],['p4','I can play from Poly, ping me'],['p14','Queueing now, need one more for the Campus Cup']]),
  S('s2',"ASU CSE & CS Class of '30",'First-years in computing majors. Homework help, hackathon teams, dorm meetups.',['Coding','Hackathons','LateNightStudy'],'Tempe',['p14','p4','p1','p8'],['e1','e2','h2'],225,[['p4','Anyone started the FSE 100 project writeup?'],['p8','Office hours in the Brickyard at 3'],['p14','Study jam at Noble Monday night, pulling up']]),
  S('s3','Sun Devil Hiking Club','Weekend trails around Phoenix, Sedona and Flagstaff. Carpools from Tempe.',['Hiking','Camping','Photography'],'Tempe',['p12','p2','p8','p3'],['e4','h4'],110,[['p12','Sunrise on A Mountain this Sunday, meet 5:45'],['p2','Bringing extra headlamps'],['p3','Driving up from downtown, save me a spot']]),
  S('s4','Accessibility Tech Builders','Students building assistive tech: sign language, vision, prosthetics. Research and hackathons.',['Accessibility','AI','ComputerVision','Robotics'],'Tempe',['p5','p11','p8'],['e1','e12'],165,[['p11','Fingerspelling dataset hit 4,000 clips'],['p5','We should enter Devils Invent together'],['p8','I can do the hardware side']]),
  S('s5','Boba Crawl Phoenix','Ranking every boba shop between Tempe and downtown, one Tuesday at a time.',['Boba','Coffee','ThriftShopping'],'Tempe',['p7','p11','p6','p3'],['e7','h3'],345,[['p7','This week: the new place on Mill'],['p6','Taro or nothing'],['p11','Rating sheet updated']]),
  S('s6','Downtown Creatives','Photographers, filmmakers and artists on the Downtown Phoenix campus.',['Photography','DigitalArt','Film','Concerts'],'Downtown Phoenix',['p3','p16','p13'],['e9'],15,[['p16','Need two extras for a night shoot Friday'],['p3','Art walk group leaves Taylor Place at 6'],['p13','I will bring snacks']]),
  S('s7','SDFC 6 AM Lifters','Early gym crew. Spotters, splits and post-workout breakfast at the MU.',['Gym','Basketball','Running'],'Tempe',['p2','p6','p10'],['h1'],40,[['p10','3v3 today at 5, need one more'],['p2','Leg day tomorrow, 6 sharp'],['p6','I will be late, save a rack']])
];
