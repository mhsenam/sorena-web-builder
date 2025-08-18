"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { 
  Sparkles, 
  Home, 
  FileCode, 
  Eye, 
  Menu,
  X,
  Layers,
  Palette,
  Download
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

const navItems = [
  {
    title: "Home",
    href: "/",
    icon: Home,
    description: "Start building your AI-powered website"
  },
  {
    title: "Templates",
    href: "/templates",
    icon: Layers,
    description: "Browse pre-built website templates"
  },
  {
    title: "Preview",
    href: "/preview",
    icon: Eye,
    description: "Preview your generated website"
  },
  {
    title: "Export",
    href: "/export",
    icon: Download,
    description: "Export your website code"
  }
]

const features = [
  {
    title: "AI Generation",
    href: "/features/ai",
    icon: Sparkles,
    description: "Powered by advanced AI models"
  },
  {
    title: "Custom Themes",
    href: "/features/themes",
    icon: Palette,
    description: "Beautiful, customizable themes"
  },
  {
    title: "Code Export",
    href: "/features/export",
    icon: FileCode,
    description: "Export clean, production-ready code"
  }
]

export function Navbar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b"
    >
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link href="/" className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="h-6 w-6 text-primary" />
            </motion.div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Sorina
            </span>
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <NavigationMenu>
            <NavigationMenuList>
              {/* Regular Nav Items */}
              {navItems.map((item, index) => (
                <NavigationMenuItem key={item.href}>
                  <Link href={item.href} legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={cn(
                          "flex items-center gap-2",
                          pathname === item.href && "text-primary"
                        )}
                      >
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                        >
                          <item.icon className="h-4 w-4" />
                        </motion.div>
                        {item.title}
                      </motion.div>
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              ))}

              {/* Features Dropdown */}
              <NavigationMenuItem>
                <NavigationMenuTrigger>
                  <motion.div
                    className="flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Layers className="h-4 w-4" />
                    Features
                  </motion.div>
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {features.map((feature) => (
                      <li key={feature.href}>
                        <NavigationMenuLink asChild>
                          <Link
                            href={feature.href}
                            className={cn(
                              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground group"
                            )}
                          >
                            <motion.div
                              whileHover={{ x: 5 }}
                              className="flex items-center gap-2"
                            >
                              <feature.icon className="h-4 w-4 text-primary" />
                              <div className="text-sm font-medium leading-none">
                                {feature.title}
                              </div>
                            </motion.div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              {feature.description}
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* CTA Button */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button variant="default" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Start Building
            </Button>
          </motion.div>

          {/* Theme Toggle */}
          <ThemeToggle />
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </motion.div>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Navigation</SheetTitle>
                <SheetDescription>
                  Navigate through Sorina AI Site Builder
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-4">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                        pathname === item.href && "bg-accent text-accent-foreground"
                      )}
                    >
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        <item.icon className="h-5 w-5" />
                      </motion.div>
                      <div>
                        <div>{item.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.description}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}

                <div className="border-t pt-4">
                  <div className="text-sm font-semibold mb-2">Features</div>
                  {features.map((feature, index) => (
                    <motion.div
                      key={feature.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (navItems.length + index) * 0.1 }}
                    >
                      <Link
                        href={feature.href}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                      >
                        <feature.icon className="h-5 w-5 text-primary" />
                        <div>
                          <div>{feature.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {feature.description}
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  className="mt-4"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button className="w-full gap-2" onClick={() => setIsOpen(false)}>
                    <Sparkles className="h-4 w-4" />
                    Start Building
                  </Button>
                </motion.div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </motion.header>
  )
}