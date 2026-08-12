import Image from 'next/image'
import voyenengaImg from '@/assets/omoss/voyenenga.jpg'
import marsipanbollerImg from '@/assets/omoss/marsipanboller.jpg'
import uteImg from '@/assets/omoss/ute.jpg'

export default function OmOss() {
  return (
    <div className="bg-4 -mt-30 pt-30">
      <div className="min-h-[calc(100dvh-4.5rem)] md:min-h-[calc(100dvh-6rem)] max-w-6xl mx-auto px-6 pt-10 md:pt-12 lg:pt-14 pb-24">

        <div className="text-center mb-12 lg:mb-16">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-special-elite text-5 mb-3">Om oss</h1>
          <p className="text-2 text-base md:text-[17px] lg:text-lg mt-4 md:mt-6 lg:mt-8">Historien om Kokeliko, hilsen daglig leder Elin</p>
        </div>

        <div className="flex flex-col gap-16 md:gap-24">

          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-10 md:gap-8 lg:gap-0">
            <div>
              <h2 className="font-special-elite text-2 text-2xl md:text-3xl lg:text-4xl mb-6">Tiden flyr…</h2>
              <div className="flex flex-col gap-4 text-2 text-base md:text-[17px] lg:text-lg leading-relaxed">
                <p>
                  I 2013 begynte dette Kokeliko-prosjektet som skulle bli en riktig så spennende og innholdsrik reise! 
                  Jeg hadde drevet systue i et lokale på Vøyenenga, men det var ikke økonomi til å drive det videre, 
                  så jeg måtte tenke nytt.
                </p>
                <p>
                  «Kan du ikke starte en kafé da?» var det en kunde som sa. Hmm... jo, DET var lurt, tenkte jeg! 
                </p>
                <p>
                  Men, hvordan går jeg i gang med det da? Et googlesøk: «Hvordan starte kafé» og det kom opp flere 
                  leverandører av storkjøkkenutstyr. Jeg ringte en av dem, og han roet meg heldigvis ned mine 1000 
                  ideer og sa: «Du starter med å selge kundene dine GOD kaffe, og kanskje noe hjemmebakt. Når kundene 
                  får god kaffe så kommer de tilbake, og DA kan du begynne å tenke videre!».
                </p>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden aspect-square md:aspect-3/4 lg:aspect-square w-full lg:w-4/5 lg:ml-auto relative">
              <Image src={voyenengaImg} alt="Vøyenenga" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" loading="eager" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-10 md:gap-8 lg:gap-0">
            <div className="order-2 md:order-1 rounded-2xl overflow-hidden aspect-square md:aspect-3/4 lg:aspect-square w-full lg:w-4/5 lg:mr-auto relative">
              <Image src={marsipanbollerImg} alt="Marsipanboller" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
            </div>
            <div className="order-1 md:order-2">
              <h2 className="font-special-elite text-2 text-2xl md:text-3xl lg:text-4xl mb-6">Vår egen bolle!</h2>
              <div className="flex flex-col gap-4 text-2 text-base md:text-[17px] lg:text-lg leading-relaxed">
                <p>
                  Dermed kom Mr. Simonelli inn i livet mitt som en skikkelig god kollega! Det er den trofaste 
                  espressomaskinen vår, som sannsynligvis må byttes på et tidspunkt, men som har levert den beste 
                  kaffen siden dag 1.
                </p>
                <p>
                  Jeg har aldri vært en god baker fordi tålmodigheten min er for dårlig til at gjæren får gjøre 
                  jobben, hehe! Men nå måtte jeg følge oppskrifter og gjøre en innsats. Oppskrifter har aldri vært 
                  min greie, men det resulterte heldigvis i MARSIPANBOLLA! Det var egentlig en kringleoppskrift som 
                  jeg modifiserte og gjorde til min egen. Uten marsipanbolla tror jeg ikke Kokeliko hadde vært det vi 
                  er i dag. Nå er den døpt om til KOKELIKOBOLLA, og vi selger over 100 av dem i uka!
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-10 md:gap-8 lg:gap-0">
            <div>
              <h2 className="font-special-elite text-2 text-2xl md:text-3xl lg:text-4xl mb-6">Kokeliko på lykke-Verket</h2>
              <div className="flex flex-col gap-4 text-2 text-base md:text-[17px] lg:text-lg leading-relaxed">
                <p>
                  Mange boller og kaffekopper, og etterhvert thaisalater og rekesmørbrød senere, flyttet vi inn i 
                  Elvegangen 9 på Bærums Verk i 2019, og her har vi lyst til å bli lenge! Fra å være bare meg, er vi nå 20 
                  flinke ansatte! Flere av jentene har jobbet hos meg i mer enn 5 år, og kommer stadig tilbake fra 
                  studier og gleder seg til å møte hverandre igjen og styre skuta mens jeg har litt ferie. Det er stas! 
                  Her er det MYE å kunne, så det å få tilbake rutinerte jenter i feriene er GULL verdt! 
                </p>
                <p>
                  Jeg er så takknemlig for å få lov til å drive med dette her, og håper og tror at det er noe vi kan 
                  fortsette med en lang stund til!
                </p>
                <p>
                  Ydmykt og takknemlig smil fra ElinPelin ♡
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
