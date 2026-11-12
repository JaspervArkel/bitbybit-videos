"""Generates video.json for the long-form pilot from the approved script.
Each caption line has a key; scenes reference [first_key, last_key]."""
import json, pathlib

L = []  # (key, text, say)
def c(key, text, say=None, hide=False):
    L.append({'key': key, 'text': text, **({'say': say} if say else {}), **({'hide': True} if hide else {})})

# 0. Cold open
c('0a', 'The internet ran out of addresses.', hide=True)
c('0b', 'Not in theory.')
c('0c', 'On the third of February 2011, the last free blocks were handed out, at a ceremony in Miami.', 'On the third of February, twenty eleven, the last free blocks were handed out, at a ceremony in Miami.')
c('0d', "And yet you're watching this.")
c('0e', 'Your phone is online. So is your TV, your laptop, maybe even your fridge.')
c('0f', 'So how does an internet with !no addresses left! keep growing?')
c('0g', 'The answer involves a guess from 1977, a trick hiding in your router,', 'The answer involves a guess from nineteen seventy-seven, a trick hiding in your router,')
c('0h', 'a market where addresses sell for twenty dollars each, and a fix that took thirty years.')
# 1
c('1a', 'Every device on the internet needs an address, like a phone number, so data knows where to go.')
c('1b', "In 1977, Vint Cerf, one of the engineers who designed the internet's core protocols,", "In nineteen seventy-seven, Vint Cerf, one of the engineers who designed the internet's core protocols,")
c('1c', 'had to decide how long those addresses would be.')
c('1d', 'Some colleagues wanted *128 bits.* Others called that crazy. Cerf picked !32.!', 'Some colleagues wanted a hundred and twenty-eight bits. Others called that crazy. Cerf picked thirty-two.')
c('1e', "Here's the reasoning. They needed a few bits to say which network you're on.")
c('1f', 'How many countries were there? Nobody knew, and there was no Google to check.')
c('1g', 'So they guessed 128, doubled it for room, and got 256 networks. That\'s eight bits.', 'So they guessed a hundred and twenty-eight, doubled it for room, and got two hundred and fifty-six networks. That\'s eight bits.')
c('1h', 'The other twenty-four bits named the computer inside each network.')
c('1i', 'Thirty-two bits gives you two to the thirty-second power: about *4.3 billion* addresses,', 'Thirty-two bits gives you two to the thirty-second power: about four point three billion addresses,')
c('1j', 'roughly one for every person on Earth at the time. For a research experiment, that was enormous.')
c('1k', 'Cerf has joked about it ever since. His summary: it was enough for an experiment.')
c('1l', 'The problem is, the experiment !never ended.!')
# 2
c('2a', 'For years, addresses were handed out generously.')
c('2b', 'Early companies and universities got blocks of nearly seventeen million addresses each.')
c('2c', 'Then came the web, then broadband, then smartphones.')
c('2d', 'The world\'s address pool is managed by an organisation called IANA,', 'The world\'s address pool is managed by an organisation called I-A-N-A,')
c('2e', 'which hands big blocks to five regional registries:')
c('2f', 'North America, Europe, Asia-Pacific, Latin America and Africa.')
c('2g', 'Each block is one two-hundred-and-fifty-sixth of all IPv4 addresses.', 'Each block is one two-hundred-and-fifty-sixth of all I P version four addresses.')
c('2h', 'At the end of January 2011, IANA gave two of its last blocks to Asia-Pacific. That left five.', 'At the end of January twenty eleven, I-A-N-A gave two of its last blocks to Asia-Pacific. That left five.')
c('2i', 'A policy agreed years earlier kicked in: one final block for each region.')
c('2j', 'On the third of February, they were handed out. The central pool was !empty.!')
c('2k', 'Then the regions ran dry, one by one. Asia-Pacific within ten weeks.')
c('2l', 'Europe rationed its last block for years, handing out tiny slices,')
c('2m', 'until the twenty-fifth of November 2019, when it made its final allocation and announced it had completely run out.', 'until the twenty-fifth of November, twenty nineteen, when it made its final allocation and announced it had completely run out.')
# 3
c('3a', 'So how are billions of new devices still getting online? Look at your router.')
c('3b', 'Your home probably has one public address, the one the rest of the internet sees.')
c('3c', 'Every device inside gets a private address instead, from ranges that are reused in millions of homes at once.')
c('3d', "That's why so many home networks use addresses starting with *192.168.*", "That's why so many home networks use addresses starting with one nine two, dot, one six eight.")
c('3e', "When your phone asks a website for something, the router swaps your phone's private address for the home's public one,")
c('3f', 'and writes down a port number to remember who asked.')
c('3g', 'When the answer comes back, it checks its table and passes the answer to your phone.')
c('3h', 'This is network address translation, or *NAT.* One public address, dozens of devices.', 'This is network address translation, or nat. One public address, dozens of devices.')
c('3i', 'It works so well that many internet providers now do it a second time, sharing one public address across many customers.')
c('3j', "That's called carrier-grade NAT.", "That's called carrier-grade nat.")
c('3k', "But it has a cost. Devices behind NAT can't easily be reached from the outside.", "But it has a cost. Devices behind nat can't easily be reached from the outside.")
c('3l', 'It\'s why some online games complain about a !strict NAT type,! why hosting a server at home can be a headache, and why peer-to-peer apps need clever workarounds.', "It's why some online games complain about a strict nat type, why hosting a server at home can be a headache, and why peer-to-peer apps need clever workarounds.")
# 4
c('4a', 'Scarcity did something else: it gave addresses a price.')
c('4b', "Companies with spare blocks sell them to companies that need them, through the registries' official transfer process.")
c('4c', 'In 2026, the average price has been around *twenty dollars* per address.', 'In twenty twenty-six, the average price has been around twenty dollars per address.')
c('4d', 'A small block of 256 addresses costs several thousand dollars.', 'A small block of two hundred and fifty-six addresses costs several thousand dollars.')
c('4e', 'Prices have actually fallen over the past year. But the market exists because the old system is !full.!')
# 5
c('5a', 'The real fix was designed in the 1990s: IPv6. Instead of 32 bits, it uses *128.*', 'The real fix was designed in the nineteen-nineties: I P version six. Instead of thirty-two bits, it uses a hundred and twenty-eight.')
c('5b', "That isn't four times as many addresses. Each extra bit doubles the count,")
c('5c', "so it's two to the hundred-and-twenty-eighth: about *340 undecillion.*", "so it's two to the hundred-and-twenty-eighth: about three hundred and forty undecillion.")
c('5d', "That's 34 followed by 37 zeros. Enough to give every grain of sand on Earth billions of billions of addresses each.", "That's thirty-four followed by thirty-seven zeros. Enough to give every grain of sand on Earth billions of billions of addresses each.")
c('5e', 'An IPv6 address looks different too: groups of hexadecimal digits separated by colons.', 'An I P version six address looks different too: groups of hexadecimal digits separated by colons.')
c('5f', "So why didn't everyone just switch? Because IPv6 can't talk directly to IPv4. They're separate languages.", "So why didn't everyone just switch? Because I P version six can't talk directly to version four. They're separate languages.")
c('5g', 'Every website, router, phone and app had to learn the new one while keeping the old one running.')
c('5h', 'For years, nobody wanted to go first.')
c('5i', "Websites didn't bother because users weren't on IPv6, and providers didn't bother because websites weren't.", "Websites didn't bother because users weren't on I P version six, and providers didn't bother because websites weren't.")
c('5j', 'And NAT made the pain bearable, so the deadline kept slipping.', 'And nat made the pain bearable, so the deadline kept slipping.')
c('5k', 'But it kept moving. Mobile networks adopted it early, because they had millions of new phones and no addresses to give them.')
c('5l', 'In several countries, most users already connect over IPv6.', 'In several countries, most users already connect over I P version six.')
c('5m', 'And in March 2026, something symbolic happened:', 'And in March twenty twenty-six, something symbolic happened:')
c('5n', 'for the first time, Google measured more than half of its users reaching it over IPv6.', 'for the first time, Google measured more than half of its users reaching it over I P version six.')
c('5o', '*Fifty point one percent,* on the twenty-eighth of March.')
# 6
c('6a', 'So, did the internet run out of addresses? Yes. In 2011, and then in region after region.', 'So, did the internet run out of addresses? Yes. In twenty eleven, and then in region after region.')
c('6b', "But it didn't stop. It bent.")
c('6c', 'One address shared by a whole home, then by a whole neighbourhood, while a far bigger address system was slowly built alongside.')
c('6d', 'Your phone may well be using both right now.')
c('6e', 'One decision from 1977 still shapes how every device you own connects.', 'One decision from nineteen seventy-seven still shapes how every device you own connects.')
c('6f', "Vint Cerf's own summary is still the best one: it was enough for an experiment. The experiment just never ended.")

IDX = {x['key']: i for i, x in enumerate(L)}
S = []
def s(k0, k1, **kw):
    S.append({'cap': [IDX[k0], IDX[k1]], **kw})
def ch(k, num, name):
    s(k, k, type='chapter', num=num, name=name)

# ---- scenes ----
s('0a', '0c', type='counter', instant=True, **{'from': 16777216, 'to': 0}, dur=1.6, delay=.1, color='o', label='free ipv4 addresses', title='The internet ran out of !addresses!', titleY=220, y=420, size=140)
s('0d', '0f', type='diagram', title='Still online', nodes=[
    {'id': 'net', 'label': 'The internet', 'x': 960, 'y': 300, 'c': 'g'},
    {'id': 'ph', 'label': 'Phone', 'x': 420, 'y': 640, 'at': .4}, {'id': 'tv', 'label': 'TV', 'x': 780, 'y': 680, 'at': .8},
    {'id': 'lp', 'label': 'Laptop', 'x': 1140, 'y': 680, 'at': 1.2}, {'id': 'fr', 'label': 'Fridge', 'x': 1500, 'y': 640, 'at': 1.6}],
  edges=[{'from': 'net', 'to': t, 'at': a} for t, a in [('ph', .5), ('tv', .9), ('lp', 1.3), ('fr', 1.7)]])
s('0g', '0h', type='timeline', title='The full story', stagger=.9, items=[
    {'label': '1977', 'sub': 'a guess'}, {'label': 'Your router', 'sub': 'a trick'}, {'label': '$20', 'sub': 'per address'}, {'label': '30 years', 'sub': 'the fix', 'c': 'o'}])
ch('1a', 1, 'Enough for an *experiment*')
s('1b', '1c', type='counter', raw=True, **{'from': 1977, 'to': 1977}, dur=.1, label='the decision', title='Vint Cerf, co-designer of TCP/IP', titleY=200, y=380, size=160)
s('1d', '1d', type='list', title='How long should an address be?', titleY=200, y=400, items=[
    {'label': 'Some colleagues', 'value': '*128 bits*', 'c': 'g'}, {'label': 'Others', 'value': '"crazy"'}, {'label': "Cerf's choice", 'value': '!32 bits!', 'c': 'o'}])
s('1e', '1e', type='bitrow', **{'from': 3405803783}, signed=False, showDec=False, label='*8 bits*: which network · 24 bits: which computer', y=330)
s('1f', '1h', type='diagram', title='The 1977 guess', nodes=[
    {'id': 'q', 'label': 'Countries?', 'sub': 'nobody knew', 'x': 330, 'y': 460},
    {'id': 'g', 'label': 'Guess: 128', 'x': 760, 'y': 460, 'at': 1.0}, {'id': 'd', 'label': '× 2 = 256 networks', 'x': 1240, 'y': 460, 'at': 2.6, 'c': 'g'},
    {'id': 'b', 'label': '8 bits', 'sub': 'network', 'x': 1240, 'y': 700, 'at': 4.0, 'c': 'g'}, {'id': 'h', 'label': '24 bits', 'sub': 'computer', 'x': 1620, 'y': 700, 'at': 6.0}],
  edges=[{'from': 'q', 'to': 'g', 'at': .8}, {'from': 'g', 'to': 'd', 'at': 2.4}, {'from': 'd', 'to': 'b', 'at': 3.8}, {'from': 'b', 'to': 'h', 'at': 5.8}])
s('1i', '1i', type='counter', **{'from': 0, 'to': 4294967296}, dur=2.2, label='possible ipv4 addresses', title='2³² =', titleY=200, titleSize=110, y=400, size=130)
s('1j', '1j', type='list', title='For an experiment, enormous', titleY=200, y=420, items=[
    {'label': 'IPv4 addresses', 'value': '*4.3 billion*', 'c': 'g'}, {'label': 'People, 1977', 'value': '~4.2 billion'}])
s('1k', '1l', type='endcard', text='"Enough for an *experiment*."', sub='Vint Cerf', y=360, size=110)
ch('2a', 2, 'The *countdown*')
s('2b', '2b', type='counter', **{'from': 0, 'to': 16777216}, dur=1.6, label='addresses in one early block', title='Handed out generously', titleY=200, y=400, size=130)
s('2c', '2c', type='timeline', title='Demand explodes', stagger=.7, items=[
    {'label': '1980s', 'sub': 'research'}, {'label': '1990s', 'sub': 'the web'}, {'label': '2000s', 'sub': 'broadband'}, {'label': '2010s', 'sub': 'smartphones', 'c': 'o'}])
REG = [('arin', 'ARIN', 'North America', 330), ('ripe', 'RIPE NCC', 'Europe', 645), ('apnic', 'APNIC', 'Asia-Pacific', 960), ('lacnic', 'LACNIC', 'Latin America', 1275), ('afrinic', 'AFRINIC', 'Africa', 1590)]
reg_nodes = [{'id': i, 'label': l, 'sub': sub, 'x': x, 'y': 680, 'at': .6 + k * .5} for k, (i, l, sub, x) in enumerate(REG)]
s('2d', '2g', type='diagram', title='Who hands out addresses', nodes=[{'id': 'iana', 'label': 'IANA', 'sub': 'the global pool', 'x': 960, 'y': 330, 'c': 'g'}] + reg_nodes,
  edges=[{'from': 'iana', 'to': i, 'at': .8 + k * .5} for k, (i, *_ ) in enumerate(REG)])
s('2h', '2h', type='counter', raw=True, **{'from': 7, 'to': 5}, dur=1.0, delay=2.2, color='o', label='blocks left at iana', title='End of January 2011', titleY=200, y=400, size=170)
BLK = {'arin': '104/8', 'ripe': '185/8', 'apnic': '103/8', 'lacnic': '179/8', 'afrinic': '102/8'}
s('2i', '2j', type='diagram', title='3 February 2011: one final block each', nodes=[{'id': 'iana', 'label': 'IANA', 'sub': 'pool: empty', 'x': 960, 'y': 330, 'c': 'o', 'at': 0}] + [dict(n, at=0) for n in reg_nodes],
  edges=[{'from': 'iana', 'to': i, 'at': 0} for i, *_ in REG],
  packets=[{'route': ['iana', i], 'start': 1.0 + k * .45, 'dur': 1.4, 'labels': [BLK[i]]} for k, (i, *_ ) in enumerate(REG)])
s('2k', '2m', type='timeline', title='Then the regions ran dry', stagger=3.2, items=[
    {'label': 'Feb 2011', 'sub': 'IANA pool empty', 'c': 'o'}, {'label': 'Apr 2011', 'sub': 'Asia-Pacific', 'c': 'o'}, {'label': 'Nov 2019', 'sub': 'Europe: completely out', 'c': 'o'}])
ch('3a', 3, 'The trick in your *router*')
HOME = [{'id': 'net', 'label': 'The internet', 'x': 960, 'y': 210},
        {'id': 'r', 'label': 'Your router', 'sub': 'public: 203.0.113.7', 'x': 960, 'y': 470, 'c': 'o', 'at': .4},
        {'id': 'p', 'label': 'Phone', 'sub': '192.168.1.12', 'x': 520, 'y': 740, 'at': 2.0}, {'id': 'l', 'label': 'Laptop', 'sub': '192.168.1.20', 'x': 960, 'y': 760, 'at': 2.4},
        {'id': 't', 'label': 'TV', 'sub': '192.168.1.31', 'x': 1400, 'y': 740, 'at': 2.8}]
s('3b', '3d', type='diagram', nodes=HOME, edges=[{'from': 'net', 'to': 'r', 'at': .6}, {'from': 'r', 'to': 'p', 'at': 2.1}, {'from': 'r', 'to': 'l', 'at': 2.5}, {'from': 'r', 'to': 't', 'at': 2.9}])
s('3e', '3f', type='diagram', title='Address translation', nodes=[
    {'id': 'p', 'label': 'Phone', 'sub': '192.168.1.12', 'x': 300, 'y': 520}, {'id': 'r', 'label': 'Router', 'sub': '203.0.113.7', 'x': 960, 'y': 520, 'c': 'o', 'at': .2},
    {'id': 'w', 'label': 'Website', 'x': 1620, 'y': 520, 'at': .4}],
  edges=[{'from': 'p', 'to': 'r', 'at': .3}, {'from': 'r', 'to': 'w', 'at': .5}],
  packets=[{'route': ['p', 'r', 'w'], 'start': 1.0, 'dur': 5.0, 'labels': ['from 192.168.1.12', 'from 203.0.113.7']}])
s('3g', '3g', type='code', y=250, cps=45, lines=['router table', '', 'port 50211  →  phone   192.168.1.12', 'port 50212  →  laptop  192.168.1.20', 'port 50213  →  tv      192.168.1.31'], output='reply for :50211  →  phone', outputColor='g')
s('3h', '3h', type='endcard', text='*NAT*: one public address, dozens of devices.', sub='network address translation', y=380, size=96)
s('3i', '3j', type='diagram', title='Carrier-grade NAT', nodes=[
    {'id': 'net', 'label': 'The internet', 'x': 960, 'y': 230}, {'id': 'isp', 'label': 'Provider', 'sub': '1 public address', 'x': 960, 'y': 470, 'c': 'o', 'at': .4}] +
    [{'id': f'h{k}', 'label': f'Home {k + 1}', 'x': 360 + k * 400, 'y': 740, 'at': 1.0 + k * .3} for k in range(4)],
  edges=[{'from': 'net', 'to': 'isp', 'at': .5}] + [{'from': 'isp', 'to': f'h{k}', 'at': 1.1 + k * .3} for k in range(4)])
s('3k', '3k', type='diagram', title='Reaching in from outside', nodes=[
    {'id': 'o', 'label': 'Someone outside', 'x': 330, 'y': 520}, {'id': 'r', 'label': 'Router', 'sub': 'which device?', 'x': 1000, 'y': 520, 'c': 'o', 'at': .2},
    {'id': 'd', 'label': 'Your device', 'x': 1600, 'y': 520, 'at': .4}],
  edges=[{'from': 'o', 'to': 'r', 'at': .3}, {'from': 'r', 'to': 'd', 'at': .5, 'c': 'o'}],
  packets=[{'route': ['o', 'r'], 'start': .8, 'dur': 1.6, 'labels': ['?'], 'c': 'o'}])
s('3l', '3l', type='list', title='The side effects', titleY=200, y=380, items=[
    {'label': 'Online games', 'value': '!NAT type: strict!', 'c': 'o'}, {'label': 'Servers at home', 'value': 'hard to reach'}, {'label': 'Peer-to-peer', 'value': 'workarounds'}])
ch('4a', 4, 'Addresses get a *price*')
s('4b', '4b', type='diagram', title='A market for used addresses', nodes=[
    {'id': 's', 'label': 'Seller', 'sub': 'spare block', 'x': 360, 'y': 520}, {'id': 'reg', 'label': 'Registry', 'sub': 'transfer', 'x': 960, 'y': 520, 'at': .3, 'c': 'g'},
    {'id': 'b', 'label': 'Buyer', 'sub': 'needs addresses', 'x': 1560, 'y': 520, 'at': .6}],
  edges=[{'from': 's', 'to': 'reg', 'at': .4}, {'from': 'reg', 'to': 'b', 'at': .7}],
  packets=[{'route': ['s', 'reg', 'b'], 'start': 1.2, 'dur': 3.5, 'labels': ['block', 'block']}])
s('4c', '4c', type='counter', **{'from': 0, 'to': 20}, dur=1.2, prefix='~$', label='per ipv4 address, 2026', title='The going rate', titleY=200, y=400, size=170)
s('4d', '4d', type='list', title='What it costs', titleY=200, y=420, items=[
    {'label': '1 address', 'value': '~$20'}, {'label': '256 addresses', 'value': '*$1,000s*', 'c': 'g'}])
s('4e', '4e', type='endcard', text='The old system is !full.!', sub='bit by bit', y=400, size=110)
ch('5a', 5, 'The 30-year *fix*')
s('5b', '5b', type='list', title='Each bit doubles it', titleY=130, y=260, stagger=.7, items=[
    {'label': '32 bits', 'value': '4.3 billion'}, {'label': '33 bits', 'value': '8.6 billion'}, {'label': '34 bits', 'value': '17.2 billion'}, {'label': '128 bits', 'value': '*…*', 'c': 'g'}])
s('5c', '5d', type='endcard', text='2¹²⁸ = *340,282,366,920,938,463,463,374,607,431,768,211,456*', sub='about 340 undecillion', y=330, size=44)
s('5e', '5e', type='code', y=330, cps=14, lines=['2001:db8:85a3::8a2e:370:7334'], output='an IPv6 address', outputColor='g')
s('5f', '5f', type='diagram', title='Two separate languages', nodes=[
    {'id': 'a', 'label': 'IPv4', 'sub': '32-bit', 'x': 560, 'y': 520, 'c': 'o'}, {'id': 'b', 'label': 'IPv6', 'sub': '128-bit', 'x': 1360, 'y': 520, 'c': 'g', 'at': .4}],
  edges=[{'from': 'a', 'to': 'b', 'at': .6}], packets=[{'route': ['a', 'b'], 'start': 1.6, 'dur': 1.8, 'labels': ['?'], 'c': 'o'}])
s('5g', '5g', type='list', title='Everyone had to speak both', titleY=130, y=260, stagger=.4, items=[
    {'label': 'Websites', 'value': '*IPv4 + IPv6*', 'c': 'g'}, {'label': 'Routers', 'value': '*IPv4 + IPv6*', 'c': 'g'}, {'label': 'Phones', 'value': '*IPv4 + IPv6*', 'c': 'g'}, {'label': 'Apps', 'value': '*IPv4 + IPv6*', 'c': 'g'}])
s('5h', '5i', type='diagram', title='Nobody wanted to go first', nodes=[
    {'id': 'w', 'label': 'Websites', 'sub': 'waiting for users', 'x': 560, 'y': 520}, {'id': 'p', 'label': 'Providers', 'sub': 'waiting for websites', 'x': 1360, 'y': 520, 'at': .5}],
  edges=[{'from': 'w', 'to': 'p', 'at': .7}],
  packets=[{'route': ['w', 'p'], 'start': 1.5, 'dur': 2.0, 'labels': ['you first'], 'c': 'o'}, {'route': ['p', 'w'], 'start': 4.0, 'dur': 2.0, 'labels': ['no, you'], 'c': 'o'}])
s('5j', '5j', type='endcard', text='NAT made the pain *bearable.*', sub='so the deadline kept slipping', y=400, size=96)
s('5k', '5l', type='list', title='But it kept moving', titleY=200, y=400, items=[
    {'label': 'Mobile networks', 'value': '*early adopters*', 'c': 'g'}, {'label': 'Many countries', 'value': '*IPv6 majority*', 'c': 'g'}])
s('5m', '5o', type='linechart', title="Google users reaching it over IPv6", dur=4.0, unit='%', yMax=60,
  points=[[2008, .3], [2010, .3], [2012, .6], [2014, 3], [2016, 10], [2018, 22], [2020, 31], [2022, 40], [2024, 45], [2026.2, 50.1]],
  xLabels=[2008, 2012, 2016, 2020, 2024], endLabel='50.1% · 28 Mar 2026', note='Curve approximate; endpoint from Google IPv6 statistics via Internet Society Pulse')
ch('6a', 6, 'The experiment never *ended*')
s('6b', '6c', type='timeline', title='It bent', stagger=2.4, items=[
    {'label': 'One home', 'sub': '1 public address'}, {'label': 'A neighbourhood', 'sub': '1 public address', 'c': 'o'}, {'label': 'IPv6', 'sub': 'built alongside', 'c': 'g'}])
s('6d', '6d', type='diagram', title='Right now', nodes=[
    {'id': 'p', 'label': 'Your phone', 'x': 960, 'y': 330, 'c': 'g'}, {'id': 'a', 'label': 'IPv4', 'x': 620, 'y': 660, 'c': 'o', 'at': .3}, {'id': 'b', 'label': 'IPv6', 'x': 1300, 'y': 660, 'c': 'g', 'at': .3}],
  edges=[{'from': 'p', 'to': 'a', 'at': .4}, {'from': 'p', 'to': 'b', 'at': .4}])
s('6e', '6e', type='counter', raw=True, **{'from': 1977, 'to': 1977}, dur=.1, label='one decision', title='Still shaping every device you own', titleY=200, y=400, size=170)
s('6f', '6f', type='endcard', text='"Enough for an *experiment*."', sub='bit by bit', y=360, size=110)

def cap(k): return IDX[k]
spec = {
    'title': 'The Internet Ran Out of Addresses (full story)',
    'format': 'landscape',
    'captions': [{k: v for k, v in x.items() if k != 'key'} for x in L],
    'scenes': S,
    'sfx': [{'cap': cap('0a'), 'at': .1, 'type': 'ticks', 'count': 4, 'every': .4}, {'cap': cap('0a'), 'at': 1.75, 'type': 'hit'},
            {'cap': cap('1d'), 'at': 2.6, 'type': 'hit'}, {'cap': cap('2h'), 'at': 3.2, 'type': 'hit'}, {'cap': cap('2j'), 'at': 2.0, 'type': 'hit'},
            {'cap': cap('2j'), 'at': 2.0, 'type': 'glitch'}, {'cap': cap('3l'), 'at': .6, 'type': 'pop'}, {'cap': cap('5o'), 'at': .2, 'type': 'hit'}],
    'cover': 1.9, 'tail': 2.0,
}
pathlib.Path(__file__).with_name('video.json').write_text(json.dumps(spec, indent=1, ensure_ascii=False))
words = sum(len((x.get('say') or x['text']).split()) for x in L)
print(len(L), 'captions,', len(S), 'scenes,', words, 'spoken words')
