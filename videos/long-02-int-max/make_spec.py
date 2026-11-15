"""Generates video.json (captions + chapter starts) for long-form video 2:
"The Number That Keeps Breaking Computers" (2,147,483,647).
Markup: *green* / !orange!. `say` = spoken form for TTS. Sources are in sources.md.
usage: python3 make_spec.py   (writes video.json next to this file)"""
import json, pathlib

L, CH = [], []
BIG = "two billion, one hundred forty-seven million, four hundred eighty-three thousand, six hundred forty-seven"


def ch(title):
    CH.append({"line": len(L), "title": title})


def c(text, say=None):
    L.append({"text": text, **({"say": say} if say else {})})


# ---- 0. cold open
ch("The number")
c("This number keeps breaking computers.")
c("!2,147,483,647.!", BIG + ".")
c("It made YouTube rebuild its *view counter.*")
c("It made regulators order airlines to switch a jet *off and on again.*")
c("Its bigger twin is the prime suspect in the loss of a *NASA spacecraft.*")
c("And in January !2038,! it's coming for the clocks.", "And in January twenty thirty-eight, it's coming for the clocks.")
c("All for the same reason. Somebody thought: !we'll never count that high.!")

# ---- 1. why this number
ch("Why this number")
c("Computers store numbers in *bits:* tiny switches that are either zero or one.")
c("For decades, the standard size for a whole number was *32* of them.", "For decades, the standard size for a whole number was thirty-two of them.")
c("32 switches give about *4.3 billion* combinations.", "Thirty-two switches give about four point three billion combinations.")
c("But programs need negative numbers too, so one switch is used for the !sign.!")
c("That leaves 31 for the value. Set them all to one, and you get *2,147,483,647.*", "That leaves thirty-one for the value. Set them all to one, and you get " + BIG + ".")
c("It works like an old car odometer with every digit at nine.")
c("Add one more, and everything !rolls over.!")
c("Except here, it doesn't roll to zero. The sign switch flips,")
c("and the biggest positive number becomes the most !negative! one.")
c("That's an *integer overflow.* And it has happened in some very expensive places.")

# ---- 2. YouTube
ch("The view counter")
c("December 2014. Gangnam Style is the most-watched video on YouTube,", "December twenty fourteen. Gangnam Style is the most-watched video on YouTube,")
c("and its view count is closing in on *2.1 billion.*", "and its view count is closing in on two point one billion.")
c("Then YouTube posts a message.")
c("It never thought a video would be watched more times than a *32-bit* number can hold.", "It never thought a video would be watched more times than a thirty-two-bit number can hold.")
c("Headlines said Gangnam Style !broke YouTube.!")
c("The truth is better. Days later, YouTube said the post was an *Easter egg.*")
c("Its engineers had seen the number coming, and moved the counter to *64 bits* months earlier.", "Its engineers had seen the number coming, and moved the counter to sixty-four bits months earlier.")
c("The new limit is over *nine quintillion* views.")
c("That's the happy version of this story: someone was watching the number.")

# ---- 3. Boeing 787
ch("The 248-day jet")
c("The next one was found in a lab.")
c("In 2015, Boeing told regulators about a problem in the *787 Dreamliner.*", "In twenty fifteen, Boeing told regulators about a problem in the seven eighty-seven Dreamliner.")
c("Each of its generators is managed by a control unit. Inside its software is a *counter.*")
c("After *248 days* of continuous power, that counter overflows,", "After two hundred forty-eight days of continuous power, that counter overflows,")
c("and the unit drops into !failsafe mode.!")
c("Power them all up together, and they all overflow together. The plane could lose !all of its AC power.!", "Power them all up together, and they all overflow together. The plane could lose all of its A C power.")
c("The FAA never published the counter's details. But do the maths.", "The F A A never published the counter's details. But do the maths.")
c("Count hundredths of a second in a signed 32-bit number, and you run out after *248.55 days.*", "Count hundredths of a second in a signed thirty-two-bit number, and you run out after two hundred forty-eight point five five days.")
c("The official fix, until new software arrived: switch the power *off and on again* before the counter gets there.")
c("It was caught in testing, not in the air.")

# ---- 4. Deep Impact
ch("The lost spacecraft")
c("A NASA spacecraft wasn't so lucky.")
c("Deep Impact launched in 2005, and famously fired a probe into a *comet.*", "Deep Impact launched in two thousand five, and famously fired a probe into a comet.")
c("Eight years later, in August 2013, it went !silent.!", "Eight years later, in August twenty thirteen, it went silent.")
c("NASA never confirmed the exact cause, but it found a potential problem with how the computer *tagged time.*")
c("Outside engineers noticed something. Count tenths of a second from the first of January 2000, in a 32-bit number,", "Outside engineers noticed something. Count tenths of a second from the first of January two thousand, in a thirty-two-bit number,")
c("and you hit the limit, about *4.29 billion,* on the !11th of August 2013.!", "and you hit the limit, about four point two nine billion, on the eleventh of August twenty thirteen.")
c("The same week contact was lost.")
c("The suspected result: the computer kept !rebooting,! the craft lost its orientation, and its antennas turned away from Earth.")
c("A month later, the mission was declared over.")

# ---- 5. Nasdaq
ch("The share price")
c("It hits money, too.")
c("In May 2021, one share of Berkshire Hathaway cost more than *420,000 dollars.*", "In May twenty twenty-one, one share of Berkshire Hathaway cost more than four hundred twenty thousand dollars.")
c("Some Nasdaq price feeds stored prices as 32-bit numbers, with four decimal places.", "Some Nasdaq price feeds stored prices as thirty-two-bit numbers, with four decimal places.")
c("So the highest price they could carry was !$429,496.! And change.", "So the highest price they could carry was four hundred twenty-nine thousand, four hundred ninety-six dollars. And change.")
c("As the share closed in, Nasdaq stopped broadcasting its price on those feeds until the software was *upgraded.*")

# ---- 6. 2038
ch("19 January 2038")
c("Which brings us to the big one.")
c("Many computers keep time by counting the *seconds* since the first of January 1970.", "Many computers keep time by counting the seconds since the first of January nineteen seventy.")
c("It's called *Unix time,* and for decades it was stored in a signed 32-bit number.", "It's called Unix time, and for decades it was stored in a signed thirty-two-bit number.")
c("You already know its limit.")
c("That many seconds after 1970 lands on the !19th of January 2038,! at seven seconds past 3:14 in the morning, UTC.", "That many seconds after nineteen seventy lands on the nineteenth of January twenty thirty-eight, at seven seconds past three fourteen in the morning, U T C.")
c("One second later, the counter flips negative, and an unpatched system thinks it's !December 1901.!", "One second later, the counter flips negative, and an unpatched system thinks it's December nineteen oh one.")
c("This is the *Year 2038 problem.*", "This is the Year twenty thirty-eight problem.")
c("The fix is the one YouTube used: store time in *64 bits.*", "The fix is the one YouTube used: store time in sixty-four bits.")
c("That lasts about *292 billion years.*", "That lasts about two hundred ninety-two billion years.")
c("Most modern phones and laptops already made the switch.")
c("The risk is in older and embedded systems: machines built to run for decades, that are !hard to update.!")
c("Engineers have a little over *eleven years* to find them.")

# ---- 7. close
ch("The pattern")
c("Every one of these stories started the same way.")
c("Someone picked a size for a number, and it seemed *impossibly big.*")
c("Two billion views. Eight months without a reboot. A share worth 400,000 dollars.", "Two billion views. Eight months without a reboot. A share worth four hundred thousand dollars.")
c("The number didn't change. The world !grew into it.!")
c("So when someone says *we'll never count that high,* remember: eventually, something does.")

here = pathlib.Path(__file__).parent
spec = {"title": "The Number That Keeps Breaking Computers", "format": "landscape", "chapters": CH, "captions": L}
(here / "video.json").write_text(json.dumps(spec, indent=1))
import re
print(len(L), "lines,", sum(len(re.sub(r"[*!]", "", x.get("say") or x["text"]).split()) for x in L), "spoken words")
