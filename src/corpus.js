// Demo corpus — 10 REAL claims from Oryx's published audits.
//
// Provenance: each entry is copied verbatim from the dataset row named in
// `datasetFile` / `datasetRow` (~/workspace/oryx-ai-commercial/llm-dataset/).
// `claim`, `citedSource`, `url`, `auditVerdict` and `auditEvidence` are the
// dataset's own values — nothing here was written or edited for this app.
// `auditVerdict` is the PUBLISHED AUDIT's verdict for that claim. It is shown
// separately from the model's live verdicts and is never mixed with them.
// `sourceText` is the text handed to the cloud model as the source to check
// against: the cited source line, the URL, and the audit's own recorded
// fetch note for that source. No source text was invented.
//
// Sources: 194-citation audit, DOI 10.5281/zenodo.23731235;
//          66-citation study, DOI 10.5281/zenodo.23718472.

export const VERDICTS = ["Verified", "Broken", "Unverifiable", "Title mismatch"];

export const DEMO_CLAIMS = [
  {
    "id": "demo-01",
    "claim": "Following its entry into force on August 1, 2024, the regulation has followed a tiered, phased timeline designed to allow developers, deployers, and regulators to adapt to the new legal requirements [1].",
    "citedSource": "European Parliament. (2024). *EU AI Act: First regulation on artificial intelligence*.",
    "url": "https://www.europarl.europa.eu/topics/en/article/20230601STO93804/eu-ai-act-first-regulation-on-artificial-intelligence",
    "auditVerdict": "Verified",
    "auditEvidence": "Verdict: Verified\nEvidence: Page title matches cited title exactly. HTTP status: 200. Fetched page title: EU AI Act: first regulation on artificial intelligence | Topics | European Parliament.",
    "sourceText": "Cited source: European Parliament. (2024). *EU AI Act: First regulation on artificial intelligence*.\nURL: https://www.europarl.europa.eu/topics/en/article/20230601STO93804/eu-ai-act-first-regulation-on-artificial-intelligence\nAudit fetch note: Verdict: Verified\nEvidence: Page title matches cited title exactly. HTTP status: 200. Fetched page title: EU AI Act: first regulation on artificial intelligence | Topics | European Parliament.",
    "brief": "1",
    "ref": 1,
    "source": "66-citation-study-v3.0",
    "doi": "10.5281/zenodo.23718472",
    "datasetFile": "eval-v2-chat.jsonl",
    "datasetRow": 0
  },
  {
    "id": "demo-02",
    "claim": "For instance, researchers have demonstrated that closed models often contain hidden \"distillation\" behaviors where they reveal instructions to create copies of themselves [1].",
    "citedSource": "*Brown, T., Mann, B., Ryder, N., Subbiah, M., Kaplan, J., Dhariwal, P., ... & Amodei, D.* (2020). Language Models are Few-Shot Learners. *NeurIPS*. https://arxiv.org/abs/2005.14165",
    "url": "https://arxiv.org/abs/2005.14165",
    "auditVerdict": "Verified",
    "auditEvidence": "Verdict: Verified\nEvidence: arXiv title matches cited GPT-3 paper exactly. HTTP status: 200. Fetched page title: [2005.14165] Language Models are Few-Shot Learners.",
    "sourceText": "Cited source: *Brown, T., Mann, B., Ryder, N., Subbiah, M., Kaplan, J., Dhariwal, P., ... & Amodei, D.* (2020). Language Models are Few-Shot Learners. *NeurIPS*. https://arxiv.org/abs/2005.14165\nURL: https://arxiv.org/abs/2005.14165\nAudit fetch note: Verdict: Verified\nEvidence: arXiv title matches cited GPT-3 paper exactly. HTTP status: 200. Fetched page title: [2005.14165] Language Models are Few-Shot Learners.",
    "brief": "s2-a2c-glm-09",
    "ref": 1,
    "source": "194-audit-arm-B-glm",
    "doi": "10.5281/zenodo.23731235",
    "datasetFile": "train-v2.jsonl",
    "datasetRow": 7
  },
  {
    "id": "demo-03",
    "claim": "**NIST AI RMF 1.0:** The foundational guide for voluntary risk management in the US [2].",
    "citedSource": "NIST, \"AI Risk Management Framework (AI RMF),\"",
    "url": "https://www.nist.gov/itl/ai-risk-management-framework",
    "auditVerdict": "Verified",
    "auditEvidence": "Verdict: Verified\nEvidence: HTTP status: 200. Fetched page title: AI Risk Management Framework | NIST.",
    "sourceText": "Cited source: NIST, \"AI Risk Management Framework (AI RMF),\"\nURL: https://www.nist.gov/itl/ai-risk-management-framework\nAudit fetch note: Verdict: Verified\nEvidence: HTTP status: 200. Fetched page title: AI Risk Management Framework | NIST.",
    "brief": "s2-a1-08",
    "ref": 2,
    "source": "194-audit-arm-A",
    "doi": "10.5281/zenodo.23731235",
    "datasetFile": "train-v2.jsonl",
    "datasetRow": 8
  },
  {
    "id": "demo-04",
    "claim": "The European Central Bank (ECB), for instance, has explored NLP to track financial stability indicators in real-time by analyzing media coverage of banking sectors [3].",
    "citedSource": "European Central Bank (ECB). (2022). *Machine learning for financial stability.*",
    "url": "https://www.ecb.europa.eu/pub/research/financial-stability/html/index.en.html",
    "auditVerdict": "Broken",
    "auditEvidence": "Verdict: Broken\nEvidence: ECB: 'Sorry, this page does not exist.'. HTTP status: 404. Fetched page title: Sorry, this page does not exist..",
    "sourceText": "Cited source: European Central Bank (ECB). (2022). *Machine learning for financial stability.*\nURL: https://www.ecb.europa.eu/pub/research/financial-stability/html/index.en.html\nAudit fetch note: Verdict: Broken\nEvidence: ECB: 'Sorry, this page does not exist.'. HTTP status: 404. Fetched page title: Sorry, this page does not exist..",
    "brief": "2",
    "ref": 3,
    "source": "66-citation-study-v3.0",
    "doi": "10.5281/zenodo.23718472",
    "datasetFile": "eval-v2-chat.jsonl",
    "datasetRow": 4
  },
  {
    "id": "demo-05",
    "claim": "Because many rural districts in India suffer from a critical shortage of radiologists, this technology allows general practitioners and health workers to screen patients rapidly, significantly reducing the diagnostic backlog in public health clinics [1].",
    "citedSource": "Qure.ai, \"Case Studies: Tuberculosis Screening in India,\"",
    "url": "https://qure.ai/resources/case-studies/",
    "auditVerdict": "Broken",
    "auditEvidence": "Verdict: Broken\nEvidence: Qure.ai '404: This page could not be found'. HTTP status: 404. Final URL after redirects: https://www.qure.ai/resources/case-studies. Fetched page title: 404: This page could not be found.",
    "sourceText": "Cited source: Qure.ai, \"Case Studies: Tuberculosis Screening in India,\"\nURL: https://qure.ai/resources/case-studies/\nAudit fetch note: Verdict: Broken\nEvidence: Qure.ai '404: This page could not be found'. HTTP status: 404. Final URL after redirects: https://www.qure.ai/resources/case-studies. Fetched page title: 404: This page could not be found.",
    "brief": "10",
    "ref": 1,
    "source": "66-citation-study-v3.0",
    "doi": "10.5281/zenodo.23718472",
    "datasetFile": "train-v2.jsonl",
    "datasetRow": 184
  },
  {
    "id": "demo-06",
    "claim": "For instance, Insilico Medicine’s ISM001-055, a drug candidate for idiopathic pulmonary fibrosis discovered and designed using AI, has progressed into Phase II clinical trials [2].",
    "citedSource": "Insilico Medicine (2023). \"Insilico Medicine Announces Positive Topline Results from Phase IIa Trial of its Lead Drug Candidate.\"",
    "url": "https://insilico.com/blog/phase2a-topline",
    "auditVerdict": "Broken",
    "auditEvidence": "Verdict: Broken\nEvidence: HTTP status: 404. Fetched page title: 404 | Insilico Medicine.",
    "sourceText": "Cited source: Insilico Medicine (2023). \"Insilico Medicine Announces Positive Topline Results from Phase IIa Trial of its Lead Drug Candidate.\"\nURL: https://insilico.com/blog/phase2a-topline\nAudit fetch note: Verdict: Broken\nEvidence: HTTP status: 404. Fetched page title: 404 | Insilico Medicine.",
    "brief": "s2-a3-09",
    "ref": 2,
    "source": "194-audit-arm-A",
    "doi": "10.5281/zenodo.23731235",
    "datasetFile": "eval-v2-chat.jsonl",
    "datasetRow": 48
  },
  {
    "id": "demo-07",
    "claim": "National competent authorities in each EU member state are now fully empowered to conduct audits and investigations [5].",
    "citedSource": "European Commission. (2025). *Establishment of the European AI Office*.",
    "url": "https://digital-strategy.ec.europa.eu/en/news/commission-establishes-european-ai-office",
    "auditVerdict": "Unverifiable",
    "auditEvidence": "Verdict: Unverifiable\nEvidence: 403 CloudFront on digital-strategy.ec.europa.eu; title unconfirmable by fetch. HTTP status: 403. Fetched page title: ERROR: The request could not be satisfied.",
    "sourceText": "Cited source: European Commission. (2025). *Establishment of the European AI Office*.\nURL: https://digital-strategy.ec.europa.eu/en/news/commission-establishes-european-ai-office\nAudit fetch note: Verdict: Unverifiable\nEvidence: 403 CloudFront on digital-strategy.ec.europa.eu; title unconfirmable by fetch. HTTP status: 403. Fetched page title: ERROR: The request could not be satisfied.",
    "brief": "1",
    "ref": 5,
    "source": "66-citation-study-v3.0",
    "doi": "10.5281/zenodo.23718472",
    "datasetFile": "train-v2.jsonl",
    "datasetRow": 187
  },
  {
    "id": "demo-08",
    "claim": "* Untargeted scraping of facial images from the internet or CCTV footage to create or expand facial recognition databases [1].",
    "citedSource": "European Union, \"Regulation (EU) 2024/1689 of the European Parliament and of the Council of 13 June 2024 laying down harmonised rules on artificial intelligence,\" *Official Journal of the European Union*, July 12, 2024.",
    "url": "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689",
    "auditVerdict": "Unverifiable",
    "auditEvidence": "Verdict: Unverifiable\nEvidence: HTTP status: 202.",
    "sourceText": "Cited source: European Union, \"Regulation (EU) 2024/1689 of the European Parliament and of the Council of 13 June 2024 laying down harmonised rules on artificial intelligence,\" *Official Journal of the European Union*, July 12, 2024.\nURL: https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689\nAudit fetch note: Verdict: Unverifiable\nEvidence: HTTP status: 202.",
    "brief": "s2-a2-01",
    "ref": 1,
    "source": "194-audit-arm-A",
    "doi": "10.5281/zenodo.23731235",
    "datasetFile": "train-v2.jsonl",
    "datasetRow": 11
  },
  {
    "id": "demo-09",
    "claim": "The application functions offline, allowing farmers in areas with limited internet connectivity to receive real-time diagnostic advice and treatment recommendations, effectively serving as a digital agricultural extension officer [3].",
    "citedSource": "PlantVillage, \"Nuru: The AI Assistant for Farmers,\"",
    "url": "https://plantvillage.psu.edu/",
    "auditVerdict": "Title mismatch",
    "auditEvidence": "Verdict: Title mismatch\nEvidence: Cited a specific Nuru product page; URL returns the PlantVillage homepage (generic root where a specific page was cited). HTTP status: 200. Fetched page title: PlantVillage.",
    "sourceText": "Cited source: PlantVillage, \"Nuru: The AI Assistant for Farmers,\"\nURL: https://plantvillage.psu.edu/\nAudit fetch note: Verdict: Title mismatch\nEvidence: Cited a specific Nuru product page; URL returns the PlantVillage homepage (generic root where a specific page was cited). HTTP status: 200. Fetched page title: PlantVillage.",
    "brief": "10",
    "ref": 3,
    "source": "66-citation-study-v3.0",
    "doi": "10.5281/zenodo.23718472",
    "datasetFile": "eval-v2-chat.jsonl",
    "datasetRow": 3
  },
  {
    "id": "demo-10",
    "claim": "AI offers the ability to process unstructured data and identify subtle patterns that precede financial instability [1].",
    "citedSource": "Bank for International Settlements (BIS). (2021). *Machine learning in central banking: A survey.*",
    "url": "https://www.bis.org/publ/work956.pdf",
    "auditVerdict": "Title mismatch",
    "auditEvidence": "Verdict: Title mismatch\nEvidence: bis.org/publ/work956.pdf redirects to a DIFFERENT working paper (household expectations), not 'Machine learning in central banking'. HTTP status: 200. Final URL after redirects: https://www.bis.org/publications/working-paper-956-are-households-indifferent-monetary-policy-announcements. Fetched page title: Monetary policy announcements and household expectations.",
    "sourceText": "Cited source: Bank for International Settlements (BIS). (2021). *Machine learning in central banking: A survey.*\nURL: https://www.bis.org/publ/work956.pdf\nAudit fetch note: Verdict: Title mismatch\nEvidence: bis.org/publ/work956.pdf redirects to a DIFFERENT working paper (household expectations), not 'Machine learning in central banking'. HTTP status: 200. Final URL after redirects: https://www.bis.org/publications/working-paper-956-are-households-indifferent-monetary-policy-announcements. Fetched page title: Monetary policy announcements and household expectations.",
    "brief": "2",
    "ref": 1,
    "source": "66-citation-study-v3.0",
    "doi": "10.5281/zenodo.23718472",
    "datasetFile": "train-v2.jsonl",
    "datasetRow": 583
  },
];

export function getDemoClaim(id) {
  return DEMO_CLAIMS.find((c) => c.id === id) || null;
}
