export function FactionPreviewCards() {
  return (
    <section className="grid grid-cols-2 gap-4 w-full h-48">
      <div className="relative rounded-lg overflow-hidden bg-liberal-bg flex flex-col items-center justify-center gap-2 border border-white/10 shadow-lg group">
        <img
          className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay group-hover:scale-110 transition-transform duration-700"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDplQ1oFFgAwhlyhwPrBJwOy_NgDRFl_U4G7aqUMSqzN4WqYR6TRnw4_sZ5okMckgWglEMwlq50pYtwL_-8dQQvZ0hifUDw9lEZp8ZhqSTs7r4ITIBqobf7FoV5Nb6eOIidK4edQ1csOE2bPo2Zdy9a-nrcoxKI0AWwwsNbwir4HqtXK3aa7h3usd2yLeB-9oWfWCJX1dfNvJmY0d8R31GtRcAOjwXo1sMNMD4XSLPC_OMs7QbKWOtWYhzzGdFeuWio0pN3F15mwZmn"
          alt=""
        />
        <span className="material-symbols-outlined text-white text-4xl">shield</span>
        <p className="font-stamp-text text-white text-lg tracking-widest">LIBERALS</p>
      </div>
      <div className="relative rounded-lg overflow-hidden bg-fascist-bg flex flex-col items-center justify-center gap-2 border border-white/10 shadow-lg group">
        <img
          className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay group-hover:scale-110 transition-transform duration-700"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuB991fk7Bi_c8dwKUPV3HFaeN2qFEpN8EhjgR0cuyMKD0x7O2s2ccRuwuOFHC78pTOigezTpSWPXiIx1p13LP5o-0F6ql3QHxWT_jkf2Y55cW0r0cDZwUr7j9TuyFW-5575LCOnRRsPgMra5fFsKKG1AMBu5wWdTUoEplH4s7tTO3wuwW8Wpp-5xBVE3eeImWheywR_URKleS-MZXEzvS9lMwvY54tWdI4BfQRjSPGF5Pho8yelFOfso1RJJtoQ3Dgx4JMYdgdkqjy6"
          alt=""
        />
        <span className="material-symbols-outlined text-white text-4xl">dangerous</span>
        <p className="font-stamp-text text-white text-lg tracking-widest">FASCISTS</p>
      </div>
    </section>
  )
}
