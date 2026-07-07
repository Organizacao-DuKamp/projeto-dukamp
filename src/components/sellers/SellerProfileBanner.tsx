import type { Seller } from "@/lib/sellers";
import { formatPhoneDisplay, telHref, whatsappUrl } from "@/lib/sellers";
import { optimizedImage } from "@/lib/image-url";
import { MapPin, Phone, Star, MessageCircle } from "lucide-react";
import bannerBg from "@/assets/seller-banner-bg.jpg";

export function SellerProfileBanner({ seller }: { seller: Seller }) {
  const wa = whatsappUrl(
    seller.whatsapp ?? seller.phone,
    `Olá ${seller.name}, vim pelo site da Dukamp!`
  );
  const phoneDisplay = formatPhoneDisplay(seller.phone ?? seller.whatsapp);
  const photo = seller.photo_url || seller.cutout_url;
  const bg = seller.banner_url || bannerBg;

  return (
    <section className="relative overflow-hidden rounded-3xl shadow-xl bg-white border border-border">
      {/* Fundo sutil de pasto */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(${bg})`, filter: "grayscale(100%)" }}
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-white/40"
        aria-hidden
      />

      {/* Curva amarela grande — canto inferior direito */}
      <div
        className="pointer-events-none absolute -right-28 -bottom-28 h-72 w-72 rounded-full bg-[#f6c515] md:h-96 md:w-96"
        aria-hidden
      />
      {/* Curva vermelha — canto superior direito */}
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-[#d81f26] md:h-64 md:w-64"
        aria-hidden
      />

      <div className="relative grid gap-6 p-6 sm:p-8 md:grid-cols-[minmax(0,260px)_minmax(0,1fr)] md:items-center md:gap-10 md:p-10">
        {/* Foto com arcos vermelho + amarelo à direita */}
        <div className="relative mx-auto md:mx-0 w-full max-w-[240px] md:max-w-[260px]">
          <div className="relative">
            {/* Arco amarelo (externo) */}
            <div
              className="absolute -right-5 -top-3 -bottom-3 w-8 rounded-r-full bg-[#f6c515] md:-right-6 md:w-10"
              aria-hidden
            />
            {/* Arco vermelho (interno) */}
            <div
              className="absolute -right-1.5 -top-1.5 -bottom-1.5 w-8 rounded-r-full bg-[#d81f26] md:w-10"
              aria-hidden
            />
            {/* Foto */}
            <div className="relative overflow-hidden rounded-2xl bg-muted aspect-square shadow-lg ring-1 ring-black/5">
              {photo ? (
                <img
                  src={optimizedImage(photo, { width: 600, quality: 85 })}
                  alt={seller.name}
                  className="h-full w-full object-cover"
                  decoding="async"
                />
              ) : (
                <div className="h-full w-full grid place-items-center text-6xl font-black text-[#d81f26]">
                  {seller.name.charAt(0)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="relative text-center md:text-left space-y-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#d81f26] text-white px-3 py-1 text-xs font-bold shadow">
            <Star className="h-3.5 w-3.5 fill-white" /> DESTAQUE
          </span>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight text-foreground">
            {seller.name}
          </h1>

          {seller.role && (
            <p className="text-base sm:text-lg font-semibold text-[#d81f26]">
              {seller.role}
            </p>
          )}

          <div className="space-y-1.5 text-sm sm:text-base text-foreground/90 pt-1">
            {seller.region && (
              <p className="flex items-center gap-2 justify-center md:justify-start">
                <MapPin className="h-4 w-4 text-[#d81f26] shrink-0" />
                <span>{seller.region}</span>
              </p>
            )}
            {phoneDisplay && (
              <p className="flex items-center gap-2 justify-center md:justify-start">
                <Phone className="h-4 w-4 text-[#d81f26] shrink-0" />
                <a href={telHref(seller.phone ?? seller.whatsapp)} className="hover:underline">
                  Tel: {phoneDisplay}
                </a>
              </p>
            )}
          </div>

          {(seller.whatsapp || seller.phone) && (
            <div className="pt-3">
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#25D366] hover:bg-[#1fbe5a] text-white font-bold px-6 py-3 shadow-lg transition-colors"
              >
                <MessageCircle className="h-5 w-5 fill-white" />
                Falar no WhatsApp
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
