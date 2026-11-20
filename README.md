# Beach Route Canas — site

Landing page da pousada **Beach Route** (Canasvieiras, Florianópolis/SC).
Site estático (HTML + Tailwind via CDN + JS puro), sem build.

## Rodar localmente
```bash
python3 -m http.server 8080
# abra http://localhost:8080
```

## Editar dados
Tudo fica em `config.js`: nome, WhatsApp, endereço, mapa, preços/temporadas, nota de avaliação e motor de reserva
(`whatsapp`, `cloudbeds`, `seazone` ou `custom`).

> ⚠️ Preços, temporadas, avaliações/depoimentos, horários de check-in/out e algumas respostas do FAQ ainda são **exemplos** — confirmar com os anfitriões antes de divulgar.
