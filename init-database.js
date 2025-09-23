const sqlite3 = require('sqlite3').verbose();

// Create database connection (supports DB_PATH for persistent disks)
const path = require('path');
const dbFilePath = process.env.DB_PATH || path.join(__dirname, 'songs.db');
const db = new sqlite3.Database(dbFilePath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  console.log('Connected to the SQLite database for initialization at', dbFilePath);
});

// Sample song data from your existing app
const sampleSongs = [
  {
    song_name: "Pies Descalzos, Sueños Blancos",
    artist_name: "Shakira",
    lyrics_spanish: `[Letra de "Pies Descalzos, Sueños Blancos"]

[Coro]
Perteneciste a una raza antigua
De pies descalzos
Y de sueños blancos
Fuiste polvo, polvo eres
Piensa que el hierro
Siempre al calor es blando

[Verso 1]
Tú mordiste la manzana
Y renunciaste al paraíso
Y condenaste a una serpiente
Siendo tú el que así lo quiso
Por milenios y milenios
Permaneciste desnudo
Y te enfrentaste a dinosaurios
Bajo un techo y sin escudo

[Pre-Coro]
Y ahora estás aquí
Queriendo ser feliz
Cuando no te importó
Un pepino tu destino

[Coro]
Perteneciste a una raza antigua
De pies descalzos
Y de sueños blancos
Fuiste polvo, polvo eres
Piensa que el hierro
Siempre al calor es blando

[Verso 2]
Construiste un mundo exacto
De acabados tan perfectos
Cada cosa calculada
En su espacio y a su tiempo
Yo que soy un caos completo
Las entradas, las salidas
Los nombres y las medidas
No me caben en los sesos

[Pre-Coro]
Y ahora estás aquí
Queriendo ser feliz
Cuando no te importó
Un pepino tu destino

[Coro]
Perteneciste a una raza antigua
De pies descalzos
Y de sueños blancos
Fuiste polvo, polvo eres
Piensa que el hierro
Siempre al calor es
Perteneciste a una raza antigua
De pies descalzos
Y de sueños blancos
Fuiste polvo, polvo eres
Piensa que el hierro
Siempre al calor es blando

[Puente]
Saludar al vecino
Acostarse a una hora
Trabajar cada día
Para vivir en la vida
Contestar solo aquello
Y sentir solo esto
Y que Dios nos ampare
De malos pensamientos
Cumplir con las tareas
Asistir al colegio
¿Que dirá la familia
Si eres un fracasado?
Ponte siempre zapatos
No hagas ruido en la mesa
Usa medias veladas
Y corbata en las fiestas
Las mujeres se casan
Siempre antes de 30
Si no vestirán santos
Y aunque así no lo quieran
Y en la fiesta de quince
Es mejor no olvidar
Una fina champaña
Y bailar bien el vals

[Outro]
Y bailar bien el vals`,
    lyrics_english: `[Lyrics of "Bare Feet, White Dreams"]

[Chorus]
You belonged to an ancient race
With bare feet
And with white dreams
You were dust, dust you are
Think that iron
Is always soft when heated

[Verse 1]
You bit into the apple
And gave up paradise
And you condemned a serpent
While you were the one who wanted it that way
For millennia and millennia
You remained naked
And you faced dinosaurs
Under a roof and without a shield

[Pre-Chorus]
And now you're here
Wanting to be happy
When you didn't care
A whit about your fate

[Chorus]
You belonged to an ancient race
With bare feet
And with white dreams
You were dust, dust you are
Think that iron
Is always soft when heated

[Verse 2]
You built an exact world
With finishes so perfect
Everything calculated
In its place and in its time
I, who am complete chaos
The entrances, the exits
The names and the measures
Don't fit inside my head

[Pre-Chorus]
And now you're here
Wanting to be happy
When you didn't care
A whit about your fate

[Chorus]
You belonged to an ancient race
With bare feet
And with white dreams
You were dust, dust you are
Think that iron
Is always at heat
You belonged to an ancient race
With bare feet
And with white dreams
You were dust, dust you are
Think that iron
Is always soft when heated

[Bridge]
Greet the neighbor
Go to bed at a set hour
Work every day
To live in this life
Only answer that
And only feel this
And may God protect us
From evil thoughts
Do your homework
Attend the school
What will the family say
If you're a failure?
Always wear shoes
Don't make noise at the table
Wear sheer stockings
And a tie at parties
Women get married
Always before thirty
If not, they'll dress saints
Even if they don't want to
And at the quinceañera
It's better not to forget
A fine champagne
And to dance the waltz well

[Outro]
And to dance the waltz well`,
    lyrics_german: `[Text von "Barfuße, weiße Träume"]

[Refrain]
Du gehörtest zu einer alten Rasse
Mit baren Füßen
Und mit weißen Träumen
Du warst Staub, Staub bist du
Denk daran, dass das Eisen
Am Feuer immer weich wird

[Strophe 1]
Du hast in den Apfel gebissen
Und auf das Paradies verzichtet
Und du hast eine Schlange verurteilt
Während du derjenige warst, der es so wollte
Über Jahrtausende und Jahrtausende
Bist du nackt geblieben
Und hast dich Dinosauriern gestellt
Unter einem Dach und ohne Schild

[Pre-Refrain]
Und jetzt bist du hier
Willst glücklich sein
Als dir dein Schicksal
Nicht die Bohne wichtig war

[Refrain]
Du gehörtest zu einer alten Rasse
Mit baren Füßen
Und mit weißen Träumen
Du warst Staub, Staub bist du
Denk daran, dass das Eisen
Am Feuer immer weich wird

[Strophe 2]
Du bautest eine exakte Welt
Mit so perfekten Abschlüssen
Alles durchkalkuliert
An seinem Platz und zu seiner Zeit
Ich, die ein völliges Chaos bin
Die Eingänge, die Ausgänge
Die Namen und die Maße
Gehen mir nicht in den Schädel

[Pre-Refrain]
Und jetzt bist du hier
Willst glücklich sein
Als dir dein Schicksal
Nicht die Bohne wichtig war

[Refrain]
Du gehörtest zu einer alten Rasse
Mit baren Füßen
Und mit weißen Träumen
Du warst Staub, Staub bist du
Denk daran, dass das Eisen
Immer am Feuer ist
Du gehörtest zu einer alten Rasse
Mit baren Füßen
Und mit weißen Träumen
Du warst Staub, Staub bist du
Denk daran, dass das Eisen
Am Feuer immer weich wird

[Bridge]
Den Nachbarn grüßen
Zu einer bestimmten Uhrzeit schlafen gehen
Jeden Tag arbeiten
Um im Leben zu leben
Nur jenes beantworten
Und nur dieses fühlen
Und Gott schütze uns
Vor bösen Gedanken
Die Aufgaben erledigen
Die Schule besuchen
Was wird die Familie sagen,
Wenn du ein Versager bist?
Trag immer Schuhe
Mach keinen Lärm am Tisch
Trage Feinstrümpfe
Und Krawatte auf Festen
Frauen heiraten
Immer vor dreißig
Sonst bekleiden sie Heilige
Auch wenn sie es nicht wollen
Und auf der Fünfzehnjahrfeier
Vergiss man besser nicht
Einen feinen Champagner
Und tanz schön den Walzer

[Outro]
Und tanz schön den Walzer`,
    youtube_link: "https://www.youtube.com/watch?v=eCna-hsmGUY&list=RDeCna-hsmGUY&start_radio=1"
  },
  {
    song_name: "DtMF",
    artist_name: "Bad Bunny",
    lyrics_spanish: `[Intro]
Eh, eh, eh, eh

[Verso 1]
Otro sunset bonito que veo en San Juan
Disfrutando de todas esas cosas que extrañan los que se van
Disfrutando de noche' de esas que ya no se dan
Que ya no se dan
Pero queriendo volver a la última vez
Que a los ojos te miré
Y contarte las cosas que no te conté (Te parece' a mi crush, jaja)
Y tirarte la' foto' que no te tiré (Acho, jura'o te ves bien linda, déjame tirarte una foto)
Ey, tengo el pecho pela'o, me dio una matá'
El corazón dándome patá'
Dime, baby, ¿dónde tú está'?
Pa' llegarle con RoRo, Julito, Krystal
Roy, Edgar, Seba, Óscar, Darnell y Big Jay, tocando batá

Hoy la calle la dejamo' 'esbaratá
Y sería cabrón que tú me toque' el güiro

Yo veo tu nombre y me salen suspiro'
No sé si son petardo' o si son tiro'
Mi blanquita, perico, mi kilo
Yo estoy en PR, tranquilo, pero

[Estribillo]
Debí tirar más fotos de cuando te tuve
Debí darte más beso' y abrazo' las vece' que pude
Ey, ojalá que los mío' nunca se muden
Y si hoy me emborracho, pues que me ayuden
Debí tirar más foto' de cuando te tuve
Debí darte más beso' y abrazo' las veces que pude
Ojalá que los mío' nunca se muden
Y si hoy me emborracho, pues que me ayuden

[Verso 2]
Ey, hoy voy a estar con abuelo to'l día, jugando dominó

Si me pregunta si aún pienso en ti, yo le digo que no
Que mi estadía cerquita de ti ya se terminó
Ya se terminó, ey
Que prendan la' máquina', voy pa' Santurce
Aquí todavía se da caña
Chequéate las babie', diablo, mami, qué dulce
Hoy yo quiero beber, beber, beber
Y hablar mierda hasta que me expulsen
'Toy bien loco ('Toy bien loco), 'toy bien loco ('Toy bien loco)
Cabrón, guía tú, que hasta caminando yo estoy que choco
'Toy bien loco ('Toy bien loco), 'toy bien loco ('Toy bien loco)
Vamo' a disfrutar, que nunca se sabe si nos queda poco
Debí tirar más f—

[Interludio]
Gente, lo' quiero con cojone', los amo
Gracias por estar aquí, de verdad
Para mí e' bien importante que estén aquí
Cada uno de ustede' significa mucho para mí
Así que, vamo' pa' la foto, vengan pa'cá
Métase to'l mundo, to'l corillo, vamo'
Zumba

[Verso 3]
Ya Bernie tiene el nene y Jan la nena

Ya no estamo' pa' la movie' y las cadena'
'Tamos pa' las cosa' que valgan la pena
Ey, pa'l perreo, la salsa, la bomba y la plena
Chequéate la mía cómo es que suena

[Outro]
Debí tirar más fotos de cuando te tuve
Debí darte más besos y abrazo' las veces que pude
Ojalá que los mío' nunca se muden
Y que tú me envíe' más nude'
Y si hoy me emborracho, que Beno me ayude`,
    lyrics_english: `[Intro]
Eh, eh, eh, eh

[Verse 1]
Another pretty sunset I see in San Juan
Enjoying all those things the ones who leave miss
Enjoying the nights, the kind that don't happen anymore
That don't happen anymore
But wanting to go back to the last time
When I looked into your eyes
And tell you the things I didn't tell you (You look like my crush, haha)
And take the pictures of you that I didn't take (Damn, you look so pretty, let me take a photo)
Hey, my chest is bare, I took a hit
My heart's kicking me
Tell me, baby, where you at?
So I can pull up with RoRo, Julito, Krystal
Roy, Edgar, Seba, Óscar, Darnell and Big Jay, playing batá

Tonight we're leaving the street torn up
And it'd be dope if you play the güiro for me

I see your name and sighs come out
I don't know if they're firecrackers or if they're shots
My white one, perico, my kilo
I'm in PR, chilling, but

[Chorus]
I should've taken more pictures from when I had you
I should've given you more kisses and hugs whenever I could
Hey, I hope my people never move away
And if I get drunk tonight, may they help me
I should've taken more pictures from when I had you
I should've given you more kisses and hugs whenever I could
I hope my people never move away
And if I get drunk tonight, may they help me

[Verse 2]
Hey, today I'm gonna be with grandpa all day, playing dominoes

If he asks me if I still think of you, I tell him no
That my stay close to you is already over
It's already over, hey
Fire up the machines, I'm heading to Santurce
They still press sugarcane here
Check out the babies, damn, mami, how sweet
Today I wanna drink, drink, drink
And talk crap until they expel me
I'm real gone (I'm real gone), I'm real gone (I'm real gone)
Bro, you drive, 'cause even walking I'm bumping into things
I'm real gone (I'm real gone), I'm real gone (I'm real gone)
Let's enjoy, you never know if we have little time left
I should've taken more p—

[Interlude]
Guys, I love you like crazy, I love you
Thanks for being here, really
It's very important to me that you're here
Each of you means a lot to me
So, let's take the photo, come here
Everybody get in, the whole crew, let's go
Zumba

[Verse 3]
Bernie already has the boy and Jan the girl

We're not about the movies and chains anymore
We're about the things that are worth it
Hey, for perreo, salsa, bomba and plena
Check out how mine sounds

[Outro]
I should've taken more photos from when I had you
I should've given you more kisses and hugs whenever I could
I hope my people never move away
And that you send me more nudes
And if I get drunk tonight, let Beno help me`,
    lyrics_german: `[Intro]
Eh, eh, eh, eh

[Strophe 1]
Noch ein schöner Sonnenuntergang, den ich in San Juan sehe
Ich genieße all die Dinge, die die Vermissenden vermissen
Ich genieße Nächte von denen, die es nicht mehr gibt
Die es nicht mehr gibt
Aber ich will zurück zu dem letzten Mal
Als ich dir in die Augen sah
Und dir die Dinge erzählen, die ich dir nicht erzählte (Du siehst aus wie mein Crush, haha)
Und dir die Fotos schießen, die ich dir nicht schoss (Ey, du siehst so hübsch aus, lass mich ein Foto machen)
Ey, meine Brust ist offen, ich hab' mir wehgetan
Das Herz gibt mir Tritte
Sag mir, Baby, wo bist du?
Damit ich mit RoRo, Julito, Krystal ankomme
Roy, Edgar, Seba, Óscar, Darnell und Big Jay, die Bata trommeln

Heute lassen wir die Straße aufgerissen zurück
Und es wär' genial, wenn du mir am Güiro spielst

Ich sehe deinen Namen und Seufzer kommen mir heraus
Ich weiß nicht, ob es Böller oder Schüsse sind
Meine Weiße, mein Perico, mein Kilo
Ich bin in PR, ganz ruhig, aber

[Refrain]
Ich hätte mehr Fotos machen sollen, als ich dich hatte
Ich hätte dir mehr Küsse und Umarmungen geben sollen, wann immer ich konnte
Ey, hoffentlich ziehen meine Leute niemals weg
Und wenn ich mich heute betrinke, dann sollen sie mir helfen
Ich hätte mehr Fotos machen sollen, als ich dich hatte
Ich hätte dir mehr Küsse und Umarmungen geben sollen, wann immer ich konnte
Hoffentlich ziehen meine Leute niemals weg
Und wenn ich mich heute betrinke, dann sollen sie mir helfen

[Strophe 2]
Ey, heute werde ich den ganzen Tag mit Opa sein und Domino spielen

Wenn er mich fragt, ob ich noch an dich denke, sage ich ihm nein
Dass mein Aufenthalt in deiner Nähe schon vorbei ist
Schon vorbei, ey
Sollen sie die Maschinen anwerfen, ich geh' nach Santurce
Hier gibt es immer noch Zuckerrohr
Schau dir die Girls an, wow, Baby, wie süß
Heute will ich trinken, trinken, trinken
Und Mist reden, bis sie mich rauswerfen
Ich bin voll durch (Ich bin voll durch), ich bin voll durch (Ich bin voll durch)
Bruder, fahr du, denn selbst zu Fuß laufe ich gegen alles
Ich bin voll durch (Ich bin voll durch), ich bin voll durch (Ich bin voll durch)
Lass uns genießen, man weiß nie, ob uns wenig übrig bleibt
Ich hätte mehr F—

[Interlude]
Leute, ich liebe euch wie verrückt, ich liebe euch
Danke, dass ihr hier seid, wirklich
Für mich ist es sehr wichtig, dass ihr hier seid
Jeder von euch bedeutet mir viel
Also, los zur Foto, kommt her
Alle rein, die ganze Crew, los
Zumba

[Strophe 3]
Bernie hat schon den Jungen und Jan das Mädchen

Wir sind nicht mehr für die Filme und die Ketten
Wir sind für die Dinge, die sich lohnen
Ey, für Perreo, Salsa, Bomba und Plena
Schau, wie meiner klingt

[Outro]
Ich hätte mehr Fotos machen sollen, als ich dich hatte
Ich hätte dir mehr Küsse und Umarmungen geben sollen, wann immer ich konnte
Hoffentlich ziehen meine Leute niemals weg
Und dass du mir mehr Nudes schickst
Und wenn ich mich heute betrinke, soll Beno mir helfen`,
    youtube_link: "https://www.youtube.com/watch?v=4X4uckVyk9o&list=RD4X4uckVyk9o"
  },
  {
    song_name: "Canta y No Llores",
    artist_name: "Tuna Decana de Madrid",
    lyrics_spanish: `Ese lunar que tienes, cielito lindo, junto a la boca
No se lo des a nadie, cielito lindo, que a mí me toca
De La Sierra Morena, cielito lindo, viene bajando
Un par de ojitos negros, cielito lindo, de contrabando
Ay ay ayay canta y no llores
Porque cantando se alegran, cielito lindo, los corazones
Ay ay ayay canta y no llores
Porque cantando se alegran, cielito lindo, los corazones
De tu puerta a la mía, cielito lindo, no hay mas que un paso
Ahora que estamos solos, cielito lindo, dame un abrazo
Pájaro que abandona, cielito lindo, su primer nido
Sí lo encuentra tu mano, cielito lindo, bien merecido
Ay ay ayay canta y no llores
Porque cantando se alegran, cielito lindo los corazones
Yo a las morenas las quiero desde que supe, desde que supe
Que por el más la Virgen cielito lindo de Guadalupe
Ay ay ayay canta y no llores
Porque cantando se alegran, cielito lindo, los corazones
Ay ay ayay canta y no llores
Porque cantando se alegran, cielito lindo, los corazones...`,
    lyrics_english: `That beauty mark you have, pretty little sky, next to your mouth
Don't give it to anyone, pretty little sky, because it's meant for me
From the Sierra Morena, pretty little sky, coming down
A pair of little black eyes, pretty little sky, smuggled in
Ay ay ayay, sing and don't cry
Because by singing, pretty little sky, hearts are cheered
Ay ay ayay, sing and don't cry
Because by singing, pretty little sky, hearts are cheered
From your door to mine, pretty little sky, there's only one step
Now that we're alone, pretty little sky, give me a hug
A bird that abandons, pretty little sky, its first nest
If your hand finds it, pretty little sky, it's well deserved
Ay ay ayay, sing and don't cry
Because by singing, pretty little sky, hearts are cheered
I've loved brunettes since I learned, since I learned
That because of the tilma the Virgin, pretty little sky, of Guadalupe
Ay ay ayay, sing and don't cry
Because by singing, pretty little sky, hearts are cheered
Ay ay ayay, sing and don't cry
Because by singing, pretty little sky, hearts are cheered...`,
    lyrics_german: `Dieses Muttermal, das du hast, himmlisches Liebchen, neben dem Mund
Gib es niemandem, himmlisches Liebchen, denn es gehört mir
Von der Sierra Morena, himmlisches Liebchen, kommt hinab
Ein Paar schwarze Augen, himmlisches Liebchen, wie geschmuggelt
Ai ai ai, sing und weine nicht
Denn beim Singen freuen sich, himmlisches Liebchen, die Herzen
Ai ai ai, sing und weine nicht
Denn beim Singen freuen sich, himmlisches Liebchen, die Herzen
Von deiner Tür zu meiner, himmlisches Liebchen, ist es nur ein Schritt
Jetzt, wo wir allein sind, himmlisches Liebchen, gib mir eine Umarmung
Ein Vogel, der verlässt, himmlisches Liebchen, sein erstes Nest
Wenn ihn deine Hand findet, himmlisches Liebchen, ist es wohlverdient
Ai ai ai, sing und weine nicht
Denn beim Singen freuen sich, himmlisches Liebchen, die Herzen
Ich liebe die Brünette, seit ich erfuhr, seit ich erfuhr
Dass wegen des Mantels die Jungfrau, himmlisches Liebchen, von Guadalupe
Ai ai ai, sing und weine nicht
Denn beim Singen freuen sich, himmlisches Liebchen, die Herzen
Ai ai ai, sing und weine nicht
Denn beim Singen freuen sich, himmlisches Liebchen, die Herzen...`,
    youtube_link: "https://www.youtube.com/watch?v=y1YqflmkOk4&list=RDy1YqflmkOk4&start_radio=1"
  },
  {
    song_name: "Las Aventuras de Ivan",
    artist_name: "TONY SOPRANOV BAND",
    lyrics_spanish: `"Las Aventuras de Ivan"

(Verse 1)
Iván Cristóbal va a descubrir,
Todo lo que el mundo tiene pa' vivir.
En Berlín con Tony y Tobias,
Corren juntos entre flores y sonrisas.

(Chorus)
Oh Iván, Iván, vamos ya,
El mundo es grande, hay que explorar,
Con dos gatitos y su risa genial,
Iván aprende sin parar.

(Verse 2)
Tony maúlla, Tobias ronronea,
Iván va cantando mientras todo lo vea.
Desde los árboles hasta el cielo azul,
Iván vuela alto con su luz.

(Chorus)
Oh Iván, Iván, vamos ya,
El mundo es grande, hay que explorar,
Con dos gatitos y su risa genial,
Iván aprende sin parar.

(Bridge)
Desde Berlín hasta el ancho mar,
Iván no deja de soñar.
Con Tony y Tobias siempre a su lado,
Todo es mágico, todo es dorado.

(Chorus)
Oh Iván, Iván, vamos ya,
El mundo es grande, hay que explorar,
Con dos gatitos y su risa genial,
Iván aprende sin parar.

(Breakdown)
Ay, Iván, mueve los pies,
Con tu ritmo, al mundo ves.
"Ey, ey, pa'lante, no pares, Iván,
Tú conquistas el mundo, eres el más grande fan."

(Chorus)
Oh Iván, Iván, vamos ya,
El mundo es grande, hay que explorar,
Con dos gatitos y su risa genial,
Iván aprende sin parar.`,
    lyrics_english: `"The Adventures of Iván"

(Verse 1)
Iván Cristóbal is going to discover
Everything the world has for living.
In Berlin with Tony and Tobias,
They run together among flowers and smiles.

(Chorus)
Oh Iván, Iván, let's go now,
The world is big, we must explore,
With two little kittens and his great laugh,
Iván keeps on learning without stop.

(Verse 2)
Tony meows, Tobias purrs,
Iván goes on singing as he sees it all.
From the trees up to the blue sky,
Iván flies high with his light.

(Chorus)
Oh Iván, Iván, let's go now,
The world is big, we must explore,
With two little kittens and his great laugh,
Iván keeps on learning without stop.

(Bridge)
From Berlin out to the wide sea,
Iván never stops dreaming.
With Tony and Tobias always at his side,
Everything is magic, everything is golden.

(Chorus)
Oh Iván, Iván, let's go now,
The world is big, we must explore,
With two little kittens and his great laugh,
Iván keeps on learning without stop.

(Breakdown)
Oh, Iván, move your feet,
With your rhythm, you see the world.
"Hey, hey, forward, don't stop, Iván,
You'll conquer the world, you're the biggest fan."

(Chorus)
Oh Iván, Iván, let's go now,
The world is big, we must explore,
With two little kittens and his great laugh,
Iván keeps on learning without stop.`,
    lyrics_german: `"Die Abenteuer von Iván"

(Strophe 1)
Iván Cristóbal wird entdecken,
Alles, was die Welt zum Leben bereithält.
In Berlin mit Tony und Tobias
rennen sie zusammen durch Blumen und Lächeln.

(Refrain)
Oh Iván, Iván, komm, wir gehen,
Die Welt ist groß, man muss sie erkunden,
Mit zwei Kätzchen und seinem tollen Lachen
lernt Iván ohne Unterlass.

(Strophe 2)
Tony miaut, Tobias schnurrt,
Iván singt weiter, während er alles sieht.
Von den Bäumen bis hinauf zum blauen Himmel
fliegt Iván hoch mit seinem Licht.

(Refrain)
Oh Iván, Iván, komm, wir gehen,
Die Welt ist groß, man muss sie erkunden,
Mit zwei Kätzchen und seinem tollen Lachen
lernt Iván ohne Unterlass.

(Bridge)
Von Berlin bis hin zum weiten Meer
hört Iván nicht auf zu träumen.
Mit Tony und Tobias stets an seiner Seite
ist alles magisch, alles golden.

(Refrain)
Oh Iván, Iván, komm, wir gehen,
Die Welt ist groß, man muss sie erkunden,
Mit zwei Kätzchen und seinem tollen Lachen
lernt Iván ohne Unterlass.

(Breakdown)
Ay, Iván, beweg die Füße,
Mit deinem Rhythmus siehst du die Welt.
"Ey, ey, vorwärts, bleib nicht stehen, Iván,
Du eroberst die Welt, du bist der größte Fan."

(Refrain)
Oh Iván, Iván, komm, wir gehen,
Die Welt ist groß, man muss sie erkunden,
Mit zwei Kätzchen und seinem tollen Lachen
lernt Iván ohne Unterlass.`,
    youtube_link: "https://www.youtube.com/watch?v=ZWmPFsnDYNw&list=OLAK5uy_nBv4HcpLO1lyT_dAT22jABKpwQSbBH0Yo"
  }
];

// Seed helper that can be reused by server.js
function seedWithDb(existingDb, done){
  existingDb.serialize(() => {
    // Create table
    existingDb.run(`CREATE TABLE IF NOT EXISTS songs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      song_name TEXT NOT NULL,
      artist_name TEXT NOT NULL,
      lyrics_spanish TEXT NOT NULL,
      lyrics_english TEXT,
      lyrics_german TEXT,
      youtube_link TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Check if table is empty
    existingDb.get("SELECT COUNT(*) as count FROM songs", [], (err, row) => {
      if (err) {
        console.error('Error checking table:', err.message);
        if (done) done(err);
        return;
      }

      if (row.count === 0) {
        console.log('Table is empty. Adding sample songs...');
        const insertQuery = 'INSERT INTO songs (song_name, artist_name, lyrics_spanish, lyrics_english, lyrics_german, youtube_link) VALUES (?, ?, ?, ?, ?, ?)';
        let remaining = sampleSongs.length;
        if(remaining === 0){ if(done) done(); return; }
        sampleSongs.forEach((song, index) => {
          existingDb.run(insertQuery, [song.song_name, song.artist_name, song.lyrics_spanish, song.lyrics_english || null, song.lyrics_german || null, song.youtube_link], function(err) {
            if (err) {
              console.error(`Error inserting song ${index + 1}:`, err.message);
            } else {
              console.log(`Added song: ${song.song_name} by ${song.artist_name} (ID: ${this.lastID})`);
            }
            remaining -= 1;
            if(remaining === 0 && done) done();
          });
        });
      } else {
        console.log(`Table already contains ${row.count} songs. Skipping sample data insertion.`);
        if (done) done();
      }
    });
  });
}

module.exports = { seedWithDb };

// When executed directly: open its own DB, seed, then close
if (require.main === module) {
  seedWithDb(db, () => {
    setTimeout(() => {
      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err.message);
        } else {
          console.log('Database initialization completed. Connection closed.');
        }
      });
    }, 500);
  });
}
