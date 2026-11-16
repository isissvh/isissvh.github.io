import { useEffect, useRef, useState } from "react";
import { locationGroups, offers as allOffers, practiceAreas } from "../data/practices.js";
import MultiSelectFilter from "../components/MultiSelectFilter.jsx";
import Icon from "../components/Icon.jsx";
import OfferCard from "../components/OfferCard.jsx";
import EmptyState from "../components/EmptyState.jsx";

function OffersPage({ savedPage = false, query, setQuery, area, setArea, location, setLocation, sort, setSort, offers: visibleOffers, savedIds, onToggleSaved, onOpenOffer, onReset, onGoOffers }) {
  const [currentPage, setCurrentPage] = useState(1);
  const offerListRef = useRef(null);
  const pageSize = 5;
  const pageCount = Math.max(1, Math.ceil(visibleOffers.length / pageSize));
  const pageOffers = visibleOffers.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const firstVisible = visibleOffers.length ? (currentPage - 1) * pageSize + 1 : 0;
  const lastVisible = Math.min(currentPage * pageSize, visibleOffers.length);
  const hasFilters = query || area.length > 0 || location.length > 0;

  useEffect(() => {
    setCurrentPage(1);
  }, [visibleOffers]);

  const goToPage = (page) => {
    setCurrentPage(page);
    window.requestAnimationFrame(() => offerListRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  return (
    <>
      <section className="welcome-row">
        <div><div className="eyebrow">{savedPage ? "TU LISTA PERSONAL" : "OPORTUNIDADES PARA TI"}</div><h1>{savedPage ? "Prácticas que guardaste" : <>Hola, John <span className="wave">👋</span></>}</h1><p>{savedPage ? "Vuelve a revisar las oportunidades que te interesaron." : "Encuentra una práctica que conecte con lo que sabes y lo que quieres aprender."}</p></div>
        <div className="welcome-side"><div className="welcome-avatar">JP</div><div><span>Tu perfil</span><strong>Ing. Civil Informática</strong><small>UTFSM · 5.º año</small></div></div>
      </section>
      {!savedPage && (
        <section className="metric-row" aria-label="Resumen de oportunidades">
            <div className="metric-card"><span className="metric-icon blue-soft"><Icon name="search" size={17} /></span><div><small>Oportunidades en catálogo</small><strong>{allOffers.length} <span>publicadas</span></strong></div><span className="metric-spark">↗</span></div>
          <div className="metric-card"><span className="metric-icon violet-soft"><Icon name="spark" size={17} /></span><div><small>Compatibles contigo</small><strong>5 <span>según tu perfil</span></strong></div><span className="metric-spark">↗</span></div>
          <div className="metric-card"><span className="metric-icon green-soft"><Icon name="building" size={17} /></span><div><small>Áreas de práctica</small><strong>{practiceAreas.length} <span>para explorar</span></strong></div><span className="metric-spark">↗</span></div>
        </section>
      )}
      <section className="offers-section">
        <div className="section-title-row offers-title"><div><div className="eyebrow">{savedPage ? "SELECCIÓN PERSONAL" : "VACANTES RECIENTES"}</div><h2>{savedPage ? "Tus prácticas guardadas" : "Prácticas para explorar"} <span className="count-pill">{visibleOffers.length}</span></h2><p>{savedPage ? "Abre el detalle para revisar requisitos o continuar." : "Ofertas con información clara para que puedas decidir con confianza."}</p></div><label className="sort-control"><span>Ordenar por</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option>Compatibilidad</option><option>Más recientes</option><option>Cierre más próximo</option></select><Icon name="down" size={14} /></label></div>
        <div className="search-panel">
          <label className="main-search"><Icon name="search" size={19} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cargo, empresa, tecnología..." aria-label="Buscar prácticas" /></label>
          <MultiSelectFilter label="Área" allLabel="Todas las áreas" options={practiceAreas} value={area} onChange={setArea} />
          <MultiSelectFilter label="Ubicación" allLabel="Todas las comunas" groups={locationGroups} value={location} onChange={setLocation} />
          <button className="filter-button" onClick={onReset}><span className="filter-glyph">☷</span> Limpiar</button>
        </div>
        <div className="result-meta"><span>{visibleOffers.length === 1 ? "1 resultado" : visibleOffers.length + " resultados"}{hasFilters && <span> para <strong>“{[query, ...area, ...location].filter(Boolean).join(", ")}”</strong></span>}</span><span className="freshness">{visibleOffers.length ? `Mostrando ${firstVisible}–${lastVisible} de ${visibleOffers.length}` : "Oportunidades abiertas"}</span></div>
        {visibleOffers.length ? (
          <>
            <div ref={offerListRef} className="offer-grid">{pageOffers.map((offer) => <OfferCard key={offer.id} offer={offer} saved={savedIds.includes(offer.id)} onSave={() => onToggleSaved(offer.id)} onOpen={() => onOpenOffer(offer)} />)}</div>
            {pageCount > 1 && <nav className="offer-pagination" aria-label="Paginación de prácticas">
              <button type="button" className="outline-button" disabled={currentPage === 1} onClick={() => goToPage(currentPage - 1)}><Icon name="chevron" size={15} /> Anterior</button>
              <div className="offer-page-numbers">{Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => <button key={page} type="button" className={page === currentPage ? "active" : ""} aria-label={`Ir a la página ${page}`} aria-current={page === currentPage ? "page" : undefined} onClick={() => goToPage(page)}>{page}</button>)}</div>
              <button type="button" className="outline-button" disabled={currentPage === pageCount} onClick={() => goToPage(currentPage + 1)}>Siguiente <Icon name="chevron" size={15} /></button>
            </nav>}
          </>
        ) : <EmptyState title={savedPage ? "Todavía no guardaste prácticas" : "No encontramos resultados"} description={savedPage ? "Guarda una oportunidad con el marcador para tenerla a mano." : "Prueba otra palabra o limpia los filtros para ver más oportunidades."} action={savedPage ? "Explorar prácticas" : "Limpiar búsqueda"} onAction={savedPage ? onGoOffers : onReset} />}
      </section>
    </>
  );
}

export default OffersPage;
