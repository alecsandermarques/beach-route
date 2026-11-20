// =====================================================================
//  CONFIGURAÇÃO DO SITE — edite só este arquivo.
//  ⚠️  Valores marcados EXEMPLO são fictícios: troque antes de publicar.
// =====================================================================
window.POUSADA = {
  nome: "Beach Route",
  cidade: "Canasvieiras, Florianópolis/SC",
  whatsapp: "5548991337746",                  // Eliane (do Instagram/linktree)
  instagram: "https://www.instagram.com/beachroutefloripa/",
  endereco: "R. Hypólito Gregório Pereira, 595 — Canasvieiras, Florianópolis/SC",
  mapsEmbed: "https://www.google.com/maps?q=R.+Hyp%C3%B3lito+Greg%C3%B3rio+Pereira,+595+-+Canasvieiras,+Florian%C3%B3polis+-+SC&output=embed",
  distanciaPraia: "Poucos passos",            // Instagram: "a poucos passos da praia" — confirmar minutos
  checkin: "14h", checkout: "11h",            // EXEMPLO

  // Prova social (deixe nota: null para esconder)
  avaliacao: { nota: 4.9, total: 87, fonte: "Airbnb e Google" }, // EXEMPLO

  // Quanto o hóspede paga a mais nas plataformas (taxa de serviço do hóspede).
  // Usado para mostrar "você economiza ~R$ X reservando direto". 0 para esconder.
  taxaPlataforma: 0.14,

  // ---------------------------------------------------------------
  // PREÇOS (EXEMPLO) — diária por unidade, com temporadas
  // temporadas: [inicio "MM-DD", fim "MM-DD", diária, mínimo de noites]
  // ---------------------------------------------------------------
  unidades: {
    cobertura: {
      nome: "Cobertura com terraço",
      curto: "Cobertura",
      hospedes: 5,
      diaria: 420, limpeza: 150, minNoites: 2,
      temporadas: [["12-20", "01-05", 690, 5], ["01-06", "02-28", 560, 3], ["03-01", "03-10", 520, 3]],
      cloudbedsRid: "", seazone: "",
    },
    apartamento: {
      nome: "Apartamento 2 quartos",
      curto: "Apartamento",
      hospedes: 5,
      diaria: 320, limpeza: 120, minNoites: 2,
      temporadas: [["12-20", "01-05", 520, 5], ["01-06", "02-28", 420, 3], ["03-01", "03-10", 390, 3]],
      cloudbedsRid: "", seazone: "",
    },
  },

  // ---------------------------------------------------------------
  // MOTOR DE RESERVA
  //  "whatsapp"  -> envia pedido com datas, hóspedes e total estimado (funciona hoje)
  //  "cloudbeds" -> igual docerecanto.com.br
  //  "seazone"   -> igual vistasdeanita.com.br (precisa ser gerido pela Seazone)
  //  "custom"    -> URL com {checkin} {checkout} {adultos} {criancas} {unidade}
  // ---------------------------------------------------------------
  motor: "whatsapp",
  cloudbeds: { codigo: "XXXXXX", host: "hotels.cloudbeds.com" },
  customUrl: "",
};
