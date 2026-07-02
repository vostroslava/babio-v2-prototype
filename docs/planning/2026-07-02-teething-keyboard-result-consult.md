# Babio Teething Keyboard Result Consult

Date: 2026-07-02

## Scenario

Recording flow: short 5-8 second phone screencast.

Typed input:

```text
My baby is teething and crying at night. What should I try first?
```

Product context:

- Baby age shown in the flow should be around 6 months, not 9 weeks.
- No fever shown.
- Wet diapers are normal.
- Result must feel calm, credible, and ad-safe.
- Babio should not diagnose. It should offer one cautious next step and clear watch-outs.

## Source-backed constraints

- AAP / HealthyChildren says first teeth commonly appear around 6-10 months, teething discomfort can happen earlier, and teething does not cause fever, diarrhea, or excessive crying.
- AAP / HealthyChildren suggests soft teething toys, gentle gum massage, cold teething cloth, and pediatrician discussion for pain medicine when needed.
- FDA warns against benzocaine, lidocaine, and homeopathic teething products for infants and children.
- FDA suggests rubbing gums with a clean finger or using a firm rubber teether, and says the teether should not be frozen.
- Dehydration red flags include fewer wet diapers, dry mouth, fewer tears, lethargy, or unusual irritability.

## Grok raw answer

Try first:

```text
Cool (not frozen) teething ring or clean finger gum massage. Extra cuddles and a calm bedtime routine may help too.
```

Supporting line:

```text
Teething can make nights harder. These are safe first steps when there’s no fever and diapers stay normal.
```

Red-flag line:

```text
Call your pediatrician for fever, breathing trouble, fewer wet diapers, severe or lasting crying, or symptoms that don’t fit teething.
```

Do not say:

- Do not promise to stop or cure pain.
- Do not recommend benzocaine, lidocaine, homeopathic teething gels, tablets, or drops.
- Do not suggest frozen teethers or numbing products.
- Do not say there is no need to call a doctor.
- Do not diagnose illness or imply the product replaces medical advice.
- Do not use miracle, before/after, or fear-based language.

## Anti raw answer

Try first:

```text
Gently massage gums with a clean finger or offer a chilled, not frozen, teething ring.
```

Supporting line:

```text
Avoid OTC teething gels, tablets, and homeopathic products, as warned by the FDA and AAP.
```

Red-flag line:

```text
Call your pediatrician for fever, breathing issues, fewer wet diapers, or severe, persistent crying.
```

Do not say:

- Do not mention benzocaine, lidocaine, Orajel, or homeopathic teething tablets/gels in a way that looks like a recommendation.
- Do not advise frozen items.
- Do not guarantee instant relief.
- Do not diagnose the child as definitely teething.

## Recommended Babio result copy

Best hero result for the app:

```text
Try first
Massage her gums with a clean finger or offer a chilled, not frozen, teething ring.
```

Context line:

```text
Because Mia is 6 mo, has no fever, and wet diapers look normal.
```

Watch card:

```text
Watch for
Fever, breathing trouble, fewer wet diapers, or crying that feels severe or unusual.
```

Safety micro-line:

```text
Skip numbing gels, teething tablets, and frozen teethers unless your pediatrician says otherwise.
```

## Shortest on-screen version

For a fast 5-8 second screencast:

```text
Try first
Clean-finger gum massage or a chilled, not frozen, teething ring.

Watch for
Fever, fewer wet diapers, breathing trouble, or unusually hard crying.
```

## UX note

The hero card should show one action only. The safety and watch-outs should appear as secondary cards below it. That keeps the screen readable while still credible.
