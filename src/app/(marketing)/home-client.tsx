"use client"

import Link from "next/link"
import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { ContatoForm } from "@/components/marketing/contato-form"
import {
  ArrowRight,
  Shield,
  Users,
  Zap,
  Target,
  Brain,
  MessageSquare,
  AlertTriangle,
  HeartPulse,
  Award,
  CheckCircle2,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Star,
  Clock,
  Briefcase,
  Mic,
  BookOpen,
  Layers,
} from "lucide-react"

const NAVY = "oklch(0.30 0.075 248)"
const NAVY_DEEP = "oklch(0.18 0.05 248)"
const GOLD = "oklch(0.74 0.14 81)"

export function FadeUp({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${NAVY_DEEP} 0%, ${NAVY} 60%, oklch(0.22 0.06 248) 100%)` }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-10" style={{ background: `radial-gradient(circle, ${GOLD}, transparent 70%)` }} />
        <div className="absolute bottom-0 -left-20 w-[400px] h-[400px] rounded-full opacity-5" style={{ background: `radial-gradient(circle, white, transparent 70%)` }} />
        <div className="absolute bottom-32 inset-x-0 h-px opacity-20" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }} />
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-24 pb-20 relative z-10">
        <div className="max-w-3xl">
          <FadeUp>
            <div className="inline-flex items-center mb-6 text-xs font-semibold tracking-widest uppercase border px-3 py-1 rounded-full" style={{ borderColor: `${GOLD}60`, color: GOLD, background: `${GOLD}15` }}>
              27 anos de aviação → seu time
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.05] mb-6">
              Alta performance{" "}
              <span className="text-gradient-gold">vem de dentro</span>{" "}
              da cabine.
            </h1>
          </FadeUp>

          <FadeUp delay={0.2}>
            <p className="text-lg md:text-xl text-white/70 leading-relaxed mb-10 max-w-xl">
              Treinamentos corporativos que traduzem a disciplina, a comunicação e a gestão de crise da aviação para a realidade das empresas. Personalizados. Aplicáveis. Transformadores.
            </p>
          </FadeUp>

          <FadeUp delay={0.3} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <Link href="#contato" className="inline-flex items-center gap-2 px-8 h-12 rounded-full font-semibold text-base cursor-pointer transition-opacity hover:opacity-90" style={{ background: GOLD, color: NAVY_DEEP }}>
              Quero um Treinamento <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="#servicos" className="inline-flex items-center gap-2 px-8 h-12 rounded-full font-semibold text-base cursor-pointer border border-white/30 text-white hover:bg-white/10 transition-colors" style={{ background: "transparent" }}>
              Ver Serviços
            </Link>
          </FadeUp>
        </div>

        <FadeUp delay={0.5}>
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-white/10">
            {[
              { value: "27+", label: "Anos na aviação" },
              { value: "200+", label: "Empresas treinadas" },
              { value: "15k+", label: "Profissionais impactados" },
              { value: "4", label: "Formatos de entrega" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-bold text-gradient-gold">{stat.value}</p>
                <p className="text-white/50 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </FadeUp>
      </div>
    </section>
  )
}

// ─── Diferenciais ─────────────────────────────────────────────────────
const diferenciais = [
  { icon: Shield, title: "Experiência Real", desc: "Não é teoria. São décadas de cockpit, operação, crise real e liderança sob pressão extrema." },
  { icon: Target, title: "Personalizado", desc: "Cada treinamento começa com escuta. Entendemos a dor da sua empresa antes de montar qualquer conteúdo." },
  { icon: Zap, title: "Aplicabilidade Imediata", desc: "Ferramentas práticas que o time usa na semana seguinte, não conceitos que ficam na apresentação." },
  { icon: Users, title: "Linguagem Corporativa", desc: "Aviação como metáfora poderosa — acessível a qualquer setor, de saúde a varejo a tecnologia." },
]

function Diferenciais() {
  return (
    <section className="py-24 bg-white" id="diferenciais">
      <div className="max-w-7xl mx-auto px-6">
        <FadeUp className="text-center mb-16">
          <p className="text-sm font-semibold tracking-widest uppercase mb-3" style={{ color: GOLD }}>Por que André Abreu</p>
          <h2 className="text-4xl md:text-5xl font-bold" style={{ color: NAVY }}>O que nos torna diferentes</h2>
        </FadeUp>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {diferenciais.map((item, i) => (
            <FadeUp key={item.title} delay={i * 0.1}>
              <div className="p-8 rounded-xl border border-slate-100 hover:border-transparent hover:shadow-xl transition-all duration-300 cursor-default">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-6" style={{ background: `${NAVY}10` }}>
                  <item.icon className="w-5 h-5" style={{ color: NAVY }} />
                </div>
                <h3 className="font-semibold text-lg mb-3" style={{ color: NAVY }}>{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Serviços ─────────────────────────────────────────────────────────
const servicos = [
  { icon: Mic, tipo: "Palestra", headline: "Uma experiência que fica", desc: "Formato pontual de alto impacto. Ideal para convenções, kick-offs e eventos corporativos.", duracao: "2 a 4 horas", ideal: "Eventos, kick-offs, convenções" },
  { icon: Users, tipo: "Workshop", headline: "Aprender fazendo", desc: "Dinâmico e prático. Participantes saem com ferramentas concretas para aplicar no dia seguinte.", duracao: "4 a 8 horas", ideal: "Times de liderança, equipes operacionais" },
  { icon: BookOpen, tipo: "Treinamento", headline: "Mudança de comportamento", desc: "Processo mais profundo com múltiplos módulos e acompanhamento. Focado em transformação real.", duracao: "Múltiplos encontros", ideal: "Gestores, líderes, equipes técnicas" },
  { icon: Layers, tipo: "Programa em Fases", headline: "Evolução contínua", desc: "Diagnóstico, implementação, acompanhamento e evolução ao longo do tempo. Para resultado duradouro.", duracao: "Semanas a meses", ideal: "Empresas em transformação cultural" },
]

function Servicos() {
  return (
    <section id="servicos" className="py-24" style={{ background: `linear-gradient(180deg, ${NAVY} 0%, ${NAVY_DEEP} 100%)` }}>
      <div className="max-w-7xl mx-auto px-6">
        <FadeUp className="text-center mb-16">
          <p className="text-sm font-semibold tracking-widest uppercase mb-3" style={{ color: GOLD }}>Formatos</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white">Escolha o formato certo</h2>
          <p className="text-white/60 mt-4 max-w-xl mx-auto">Cada empresa tem uma necessidade diferente. Vamos conversar para encontrar o formato ideal.</p>
        </FadeUp>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {servicos.map((s, i) => (
            <FadeUp key={s.tipo} delay={i * 0.1}>
              <div className="flex flex-col h-full p-8 rounded-xl border border-white/10 hover:border-[oklch(0.74_0.14_81)/50%] bg-white/5 hover:bg-white/8 transition-all duration-300 cursor-default">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-5" style={{ background: `${GOLD}20` }}>
                  <s.icon className="w-5 h-5" style={{ color: GOLD }} />
                </div>
                <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: GOLD }}>{s.tipo}</p>
                <h3 className="font-bold text-lg text-white mb-3">{s.headline}</h3>
                <p className="text-white/55 text-sm leading-relaxed flex-1">{s.desc}</p>
                <div className="mt-6 pt-5 border-t border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-white/40"><Clock className="w-3 h-3" />{s.duracao}</div>
                  <div className="flex items-center gap-2 text-xs text-white/40"><Briefcase className="w-3 h-3" />{s.ideal}</div>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
        <FadeUp delay={0.4} className="text-center mt-12">
          <Link href="#contato" className={cn(buttonVariants({ size: "lg" }), "font-semibold cursor-pointer")} style={{ background: GOLD, color: NAVY_DEEP, borderColor: "transparent" }}>
            Falar sobre o meu caso <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </FadeUp>
      </div>
    </section>
  )
}

// ─── Temas ────────────────────────────────────────────────────────────
const temas = [
  { icon: Brain, label: "Fator Humano" },
  { icon: Shield, label: "Gestão de Crise" },
  { icon: Users, label: "Trabalho em Equipe" },
  { icon: MessageSquare, label: "Comunicação Eficaz" },
  { icon: AlertTriangle, label: "Tomada de Decisão" },
  { icon: HeartPulse, label: "Gestão Emocional" },
  { icon: Target, label: "Performance sob Pressão" },
  { icon: Award, label: "Liderança Situacional" },
  { icon: Zap, label: "Cultura Organizacional" },
  { icon: CheckCircle2, label: "Experiência do Cliente" },
  { icon: Clock, label: "Fadiga e Segurança" },
  { icon: Layers, label: "Protocolos e Processos" },
]

function Temas() {
  return (
    <section id="temas" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <FadeUp className="text-center mb-16">
          <p className="text-sm font-semibold tracking-widest uppercase mb-3" style={{ color: GOLD }}>Temas</p>
          <h2 className="text-4xl md:text-5xl font-bold" style={{ color: NAVY }}>O que podemos trabalhar</h2>
          <p className="text-slate-500 mt-4 max-w-xl mx-auto">Os mesmos temas que mantêm aviões seguros no ar — adaptados para manter empresas performando em terra.</p>
        </FadeUp>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {temas.map((tema, i) => (
            <FadeUp key={tema.label} delay={i * 0.05}>
              <div className="flex flex-col items-center gap-3 p-5 rounded-xl bg-white border border-slate-100 hover:shadow-lg transition-all duration-300 cursor-default text-center group">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200" style={{ background: `${NAVY}08` }}>
                  <tema.icon className="w-4 h-4" style={{ color: NAVY }} />
                </div>
                <span className="text-xs font-medium leading-tight" style={{ color: NAVY }}>{tema.label}</span>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Sobre ────────────────────────────────────────────────────────────
function Sobre() {
  return (
    <section id="sobre" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <FadeUp>
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden" style={{ background: `linear-gradient(135deg, ${NAVY_DEEP} 0%, ${NAVY} 100%)` }}>
              <div className="absolute top-10 right-10 w-40 h-40 rounded-full opacity-20" style={{ background: `radial-gradient(circle, ${GOLD}, transparent 70%)` }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white/90 px-12">
                  <p className="text-7xl font-black text-gradient-gold leading-none">27</p>
                  <p className="text-lg font-medium text-white/80 mt-2">anos de aviação</p>
                  <div className="mt-8 space-y-3 text-left">
                    {["Piloto comercial", "Instrutor de simulador", "Gerência de operações", "Gestão de segurança"].map((item) => (
                      <div key={item} className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: GOLD }} />
                        <span className="text-sm text-white/70">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 inset-x-0 h-1" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }} />
            </div>
          </FadeUp>
          <FadeUp delay={0.15}>
            <p className="text-sm font-semibold tracking-widest uppercase mb-4" style={{ color: GOLD }}>Sobre André Abreu</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: NAVY }}>Da cabine para a sala de reunião.</h2>
            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>Com mais de 27 anos de experiência prática na aviação — em operação, instrução e liderança — André Abreu desenvolveu uma visão única sobre o que faz equipes funcionarem em ambientes de alta pressão.</p>
              <p>A aviação não tolera falhas de comunicação, liderança fraca ou decisões mal tomadas. Por isso construiu ao longo das décadas uma cultura de segurança, performance e responsabilidade que poucas indústrias conseguem replicar.</p>
              <p>O trabalho de André é traduzir essa experiência real para o contexto de cada empresa, respeitando a cultura e as particularidades de cada time.</p>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-6 pt-8 border-t border-slate-100">
              {[{ value: "27+", label: "Anos de aviação" }, { value: "MBA", label: "Gestão de pessoas" }, { value: "IATA", label: "Certificações" }].map((item) => (
                <div key={item.label}>
                  <p className="text-2xl font-bold" style={{ color: NAVY }}>{item.value}</p>
                  <p className="text-xs text-slate-400 mt-1">{item.label}</p>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  )
}

// ─── Depoimentos ─────────────────────────────────────────────────────
interface TestimonialData {
  id: string
  authorName: string
  authorRole: string | null
  company: string | null
  content: string
}

function Depoimentos({ items }: { items: TestimonialData[] }) {
  const fallback: TestimonialData[] = [
    { id: "f1", authorName: "Carolina Duarte", authorRole: "Diretora de RH", company: "Grupo Saúde São Lucas", content: "O workshop do André transformou como nossos gestores lidam com situações de pressão. A analogia com a aviação torna tudo concreto e aplicável. Resultado imediato." },
    { id: "f2", authorName: "Ricardo Almeida", authorRole: "CEO", company: "Construtora Alvorada", content: "Já fizemos vários treinamentos ao longo dos anos. O André é diferente — ele começa entendendo quem somos antes de falar qualquer coisa. O treinamento foi feito para nós." },
    { id: "f3", authorName: "Fernanda Costa", authorRole: "Gerente de Operações", company: "Logtech Brasil", content: "A sessão sobre comunicação em situações críticas mudou nossa cultura de reuniões. Hoje somos mais diretos, eficientes e muito menos reativos." },
  ]

  const depoimentos = items.length > 0 ? items : fallback

  return (
    <section className="py-24" style={{ background: `linear-gradient(180deg, ${NAVY_DEEP} 0%, ${NAVY} 100%)` }}>
      <div className="max-w-7xl mx-auto px-6">
        <FadeUp className="text-center mb-16">
          <p className="text-sm font-semibold tracking-widest uppercase mb-3" style={{ color: GOLD }}>Depoimentos</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white">O que dizem as empresas</h2>
        </FadeUp>
        <div className="grid md:grid-cols-3 gap-8">
          {depoimentos.slice(0, 3).map((dep, i) => (
            <FadeUp key={dep.id} delay={i * 0.1}>
              <div className="flex flex-col h-full p-8 rounded-xl bg-white/6 border border-white/10 hover:bg-white/10 transition-all duration-300">
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-current" style={{ color: GOLD }} />
                  ))}
                </div>
                <p className="text-white/80 text-sm leading-relaxed flex-1 italic">&ldquo;{dep.content}&rdquo;</p>
                <div className="mt-8 pt-6 border-t border-white/10">
                  <p className="font-semibold text-white text-sm">{dep.authorName}</p>
                  <p className="text-white/40 text-xs mt-0.5">
                    {[dep.authorRole, dep.company].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Blog ─────────────────────────────────────────────────────────────
interface BlogPostPreview {
  id: string
  title: string
  slug: string
  excerpt: string | null
  tags: string[]
  publishedAt: Date | null
}

function Blog({ posts }: { posts: BlogPostPreview[] }) {
  const fallback: BlogPostPreview[] = [
    { id: "f1", slug: "comunicacao-cockpit-reunioes", tags: ["Comunicação"], title: "O que a comunicação do cockpit pode ensinar às suas reuniões", excerpt: "Na aviação, comunicação ambígua custa vidas. Nas empresas, custa projetos, clientes e talentos.", publishedAt: null },
    { id: "f2", slug: "tomada-de-decisao-sob-pressao", tags: ["Liderança"], title: "Tomada de decisão sob pressão: o modelo que pilotos usam em emergência", excerpt: "Quando tudo dá errado ao mesmo tempo, pilotos não improvisam — seguem um modelo mental treinado para situações de alta pressão.", publishedAt: null },
    { id: "f3", slug: "fator-humano-times-alta-performance", tags: ["Fator Humano"], title: "Fator humano: por que times de alta performance ainda erram", excerpt: "Profissionais competentes, treinados e motivados ainda cometem erros. A aviação estudou esse fenômeno por décadas.", publishedAt: null },
  ]

  const items = posts.length > 0 ? posts : fallback

  return (
    <section id="blog" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        <FadeUp className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16">
          <div>
            <p className="text-sm font-semibold tracking-widest uppercase mb-3" style={{ color: GOLD }}>Blog</p>
            <h2 className="text-4xl md:text-5xl font-bold" style={{ color: NAVY }}>Conteúdo que aterra</h2>
          </div>
          <Link href="/blog" className="flex items-center gap-2 text-sm font-semibold transition-colors cursor-pointer" style={{ color: NAVY }}>
            Ver todos os artigos <ArrowRight className="w-4 h-4" />
          </Link>
        </FadeUp>
        <div className="grid md:grid-cols-3 gap-8">
          {items.slice(0, 3).map((post, i) => (
            <FadeUp key={post.id} delay={i * 0.1}>
              <Link href={`/blog/${post.slug}`} className="group block cursor-pointer">
                <div className="aspect-[16/9] rounded-xl mb-5 overflow-hidden flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${NAVY_DEEP}, ${NAVY})` }}>
                  <BookOpen className="w-12 h-12 text-white opacity-20" />
                </div>
                <div className="flex items-center gap-3 mb-3">
                  {post.tags[0] && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ background: `${GOLD}15`, color: NAVY }}>
                      {post.tags[0]}
                    </span>
                  )}
                  {post.publishedAt && (
                    <span className="text-xs text-slate-400">
                      {new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(post.publishedAt))}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-lg leading-tight mb-2 group-hover:underline" style={{ color: NAVY }}>{post.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">{post.excerpt}</p>
              </Link>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Contato ─────────────────────────────────────────────────────────
function Contato() {
  return (
    <section id="contato" className="py-24" style={{ background: NAVY_DEEP }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16">
          <FadeUp>
            <p className="text-sm font-semibold tracking-widest uppercase mb-4" style={{ color: GOLD }}>Contato</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Vamos conversar sobre o seu time.</h2>
            <p className="text-white/60 leading-relaxed mb-10">Cada projeto começa com escuta. Conte o contexto da sua empresa e vamos pensar juntos no melhor formato.</p>
            <div className="space-y-4">
              <a href="https://wa.me/5511999999999?text=Olá André, gostaria de saber mais sobre os treinamentos." target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-5 rounded-xl border border-white/10 hover:border-green-400/40 hover:bg-green-400/5 transition-all duration-300 group cursor-pointer">
                <div className="w-10 h-10 rounded-lg bg-green-400/15 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">WhatsApp</p>
                  <p className="text-white/40 text-xs mt-0.5">Resposta em até 2 horas</p>
                </div>
                <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-white/60 ml-auto transition-colors" />
              </a>
              <div className="flex items-center gap-4 p-5 rounded-xl border border-white/10">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${GOLD}20` }}>
                  <Mail className="w-5 h-5" style={{ color: GOLD }} />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">E-mail</p>
                  <p className="text-white/40 text-xs mt-0.5">andre@andreabreuaviacao.com.br</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-5 rounded-xl border border-white/10">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-white/50" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Localização</p>
                  <p className="text-white/40 text-xs mt-0.5">São Paulo, SP · Atendimento em todo o Brasil</p>
                </div>
              </div>
            </div>
          </FadeUp>
          <FadeUp delay={0.15}><ContatoForm /></FadeUp>
        </div>
      </div>
    </section>
  )
}

// ─── Export ───────────────────────────────────────────────────────────
export function HomeClient({
  testimonials,
  blogPosts,
}: {
  testimonials: TestimonialData[]
  blogPosts: BlogPostPreview[]
}) {
  return (
    <>
      <Hero />
      <Diferenciais />
      <Servicos />
      <Temas />
      <Sobre />
      <Depoimentos items={testimonials} />
      <Blog posts={blogPosts} />
      <Contato />
    </>
  )
}
