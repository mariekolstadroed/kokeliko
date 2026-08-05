import Image from 'next/image'
import voyenengaImg from '@/assets/omoss/voyenenga.jpg'
import marsipanbollerImg from '@/assets/omoss/marsipanboller.jpg'
import uteImg from '@/assets/omoss/ute.jpg'

export default function OmOss() {
  return (
    <div>
      <div className="max-w-6xl mx-auto px-6 pt-10 md:pt-12 lg:pt-14 pb-24">

        <div className="text-center mb-8 md:mb-12 lg:mb-16">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-special-elite text-[#2E1608] mb-3">Om oss</h1>
          <p className="text-stone-500 text-base md:text-[17px] lg:text-lg mt-4 md:mt-6 lg:mt-8">Historien om Kokeliko</p>
        </div>

        <div className="flex flex-col gap-16 md:gap-24">

          {/* Seksjon 1 — tekst venstre, bilde høyre */}
          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-10 md:gap-8 lg:gap-0">
            <div>
              <h2 className="font-special-elite text-[#2E1608] text-2xl md:text-3xl lg:text-4xl mb-6">Tiden flyr…</h2>
              <div className="flex flex-col gap-4 text-stone-700 text-base md:text-[17px] lg:text-lg leading-relaxed">
                <p>
                  For 13 (!!!) år siden begynte dette KokelikoProsjektet som skulle bli en riktig så spennende og
                  innholdsrik reise!
                </p>
                <p>
                  Jeg hadde drevet systue i et lokale på Vøyenenga, men det var ikke var økonomi til å drive det
                  videre så jeg måtte tenke nytt. Jeg malte litt bilder og holdt på med flere ting samtidig, men
                  visste ikke helt hva jeg skulle gjøre i lokalene som hadde en løpende leiekontrakt?
                </p>
                <p>
                  «Kan du ikke starte en kafe da?» var det en som sa. Hmm.. Jo DET var lurt tenkte jeg!
                </p>
                <p>
                  Men, hvordan går jeg i gang med det da? Dette ante jeg jo ikke noe om, men det kunne jeg vel få
                  til? Jeg hadde jobbet på et par kafeer tidligere så jeg visste at dette var noe jeg ville like,
                  men å drive et sted? Tja.. Jeg tenkte ikke så mye over hva det ville innebære den gang da.
                </p>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden aspect-square md:aspect-3/4 lg:aspect-square w-full lg:w-4/5 lg:ml-auto relative">
              <Image src={voyenengaImg} alt="Vøyenenga" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" loading="eager" />
            </div>
          </div>

          {/* Seksjon 2 — bilde venstre, tekst høyre */}
          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-10 md:gap-8 lg:gap-0">
            <div className="order-2 md:order-1 rounded-2xl overflow-hidden aspect-square md:aspect-3/4 lg:aspect-square w-full lg:w-4/5 lg:mr-auto relative">
              <Image src={marsipanbollerImg} alt="Marsipanboller" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
            </div>
            <div className="order-1 md:order-2">
              <h2 className="font-special-elite text-[#2E1608] text-2xl md:text-3xl lg:text-4xl mb-6">Mr. Simonelli gjør sitt inntog</h2>
              <div className="flex flex-col gap-4 text-stone-700 text-base md:text-[17px] lg:text-lg leading-relaxed">
                <p>
                  Et googlesøk: «Hvordan starte kafe» og det kom opp flere leverandører av storkjøkkenutstyr.
                  Jeg ringte en av dem, og der skulle jeg være så heldig å finne Christian! Han hadde masse
                  kompetanse, og var en dyktig selger.
                </p>
                <p>
                  Det viste seg at han ikke ønsket å selge meg katta i sekken, men var litt autoritær og roet
                  ned mine 1000-ideer og sa:
                </p>
                <p>
                  «Du starter med å selge kundene dine GOD kaffe, og kanskje noe hjemmebakt. Når kundene får
                  god kaffe så kommer de tilbake — og DA kan du begynne å tenke videre!»
                </p>
                <p>
                  Så slik kom MR.Simonelli inn i livet mitt som en skikkelig god kollega! Det ble en prøve for
                  å få godkjent serveringsbevilling, utarbeidelse av IK-Mat og masse utstyr som skulle på plass.
                </p>
              </div>
            </div>
          </div>

          {/* Seksjon 3 — tekst venstre, bilde høyre */}
          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-10 md:gap-8 lg:gap-0">
            <div>
              <h2 className="font-special-elite text-[#2E1608] text-2xl md:text-3xl lg:text-4xl mb-6">13 år og mye klokere</h2>
              <div className="flex flex-col gap-4 text-stone-700 text-base md:text-[17px] lg:text-lg leading-relaxed">
                <p>
                  Mange fangede baller, 13 år senere og ganske så mye klokere bor Kokeliko nå i Elvegangen 9
                  på Bærums Verk. Vi er i gang med vårt 7.de år på Lykkeverket og stortrives!
                </p>
                <p>
                  Vi har et stort ønske om å bli gamle sammen med dere der, og vi får se da — Hvor lenge
                  Mr.Simonelli holder ut? Jeg fikk beskjed om at han hadde en levetid på ca 5 år, men han har
                  fått masse kjærlighet og service så han er fortsatt vår trofaste kollega som lager de beste
                  kaffedrikker!
                </p>
                <p>
                  Fra å være bare meg på 160cm, er vi nå 20 ansatte med stort og smått. Flere av jentene har
                  jobbet hos meg mer enn 5 år, og kommer tilbake fra studier og gleder seg til å møte hverandre
                  igjen og styre skuta mens jeg har litt ferie. Det er stas!
                </p>
                <p>
                  Mange unge søker sommerjobb hos oss, men det er langt mer enn å lage kaffe bak
                  KokelikoDisken. Så det å få tilbake rutinerte jenter som kan jobben er GULL verdt!
                </p>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden aspect-square md:aspect-3/4 lg:aspect-square w-full lg:w-4/5 lg:ml-auto relative">
              <Image src={uteImg} alt="Ute" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
