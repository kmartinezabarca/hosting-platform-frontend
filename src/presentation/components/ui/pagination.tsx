import * as React from "react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from "lucide-react"
import { useTranslation } from "react-i18next"

import { cn } from "@shared/utils/utils"
import { buttonVariants } from "@presentation/components/ui/button";

function Pagination({
  className,
  ...props
}) {
  const { t } = useTranslation();

  return (
    <nav
      role="navigation"
      aria-label={t("a11y.pagination")}
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props} />
  );
}

function PaginationContent({
  className,
  ...props
}) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props} />
  );
}

function PaginationItem({
  ...props
}) {
  return <li data-slot="pagination-item" {...props} />;
}

function PaginationLink({
  className,
  isActive,
  size = "icon",
  ...props
}: any) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(buttonVariants({
        variant: isActive ? "outline" : "ghost",
        size,
      }), className)}
      {...props} />
  );
}

function PaginationPrevious({
  className,
  ...props
}: any) {
  const { t } = useTranslation();

  return (
    <PaginationLink
      aria-label={t("a11y.previousPage")}
      size="default"
      isActive={false}
      className={cn("gap-1 px-2.5 sm:pl-2.5", className)}
      {...props}>
      <ChevronLeftIcon />
      <span className="hidden sm:block">{t("common.previous")}</span>
    </PaginationLink>
  );
}

function PaginationNext({
  className,
  ...props
}: any) {
  const { t } = useTranslation();

  return (
    <PaginationLink
      aria-label={t("a11y.nextPage")}
      size="default"
      isActive={false}
      className={cn("gap-1 px-2.5 sm:pr-2.5", className)}
      {...props}>
      <span className="hidden sm:block">{t("common.next")}</span>
      <ChevronRightIcon />
    </PaginationLink>
  );
}

function PaginationEllipsis({
  className,
  ...props
}) {
  const { t } = useTranslation();

  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}>
      <MoreHorizontalIcon className="size-4" />
      <span className="sr-only">{t("a11y.morePages")}</span>
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
}
