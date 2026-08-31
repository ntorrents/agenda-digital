# Documentació legal — Petit Diari

Borradors per revisió abans de publicar a **petitdiari.com** i enllaços des de **app.petitdiari.com**.

## Titular del servei

| Camp | Valor |
|------|--------|
| Titular | Nil Torrents González |
| NIF | 39520320H |
| Domicili fiscal | Carrer Camí de Castellar, Terrassa, 08226, Espanya |
| Correu | hola@petitdiari.com |
| Responsable RGPD | Nil Torrents González (mateix contacte) |
| Jurisdicció | Espanya — Catalunya |

## Estructura de fitxers

```
docs/legal/
├── ca/          ← Català (idioma principal)
├── es/          ← Castellà
├── contact-form-copy.md
├── app-links-copy.md
└── footer-links-copy.md
```

## URLs previstes (web)

| Pàgina | URL CA | URL ES |
|--------|--------|--------|
| Avís legal | `/legal/avis-legal` | `/legal/aviso-legal` |
| Privacitat | `/legal/privacitat` | `/legal/privacidad` |
| Cookies | `/legal/cookies` | `/legal/cookies` |
| Termes d'ús | `/legal/termes` | `/legal/terminos` |
| Centres educatius | `/legal/centres` | `/legal/centros` |
| Encàrrec RGPD (DPA) | `/legal/encarrec-tractament` | `/legal/encargo-tratamiento` |

> El DPA complet es pot oferir com a PDF descarregable per a escoles client (no cal enllaçar-lo al footer públic; sí des del panell d'administració).

## Formulari de contacte (sense checkbox)

No cal checkbox obligatori: l'usuari inicia la consulta i només es respon al missatge (sense publicitat). Sí cal **text informatiu** + enllaç a privacitat (veure `contact-form-copy.md`).

## Checklist abans de publicar

- [ ] Revisar textos (idealment amb assessor legal si hi ha clients de pagament)
- [ ] Confirmar subencarregats i regions (Supabase, Resend, Vercel)
- [ ] Implementar pàgines `/legal/*` a la web
- [ ] Actualitzar footer web
- [ ] Afegir text al formulari de contacte
- [ ] Enllaços a login, footer app i ajuda família
- [ ] Preparar PDF contracte + DPA per a escoles

## Última actualització

31 d'agost de 2026
