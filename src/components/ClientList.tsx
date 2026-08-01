// File: src/components/ClientList.tsx

"use client";

import { useState } from "react";
import ClientTable from "@/components/ClientTable";
import SearchBar from "@/components/SearchBar";
import StatusFilter from "@/components/StatusFilter";

type Client = {
  id: string;
  name: string;
  phone: string;
  status: string;
};

export default function ClientList({
  clients,
}: {
  clients: Client[];
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const filteredClients = clients.filter((client) => {
    const keyword = search.toLowerCase();

    const matchesSearch =
      client.name.toLowerCase().includes(keyword) ||
      client.phone.toLowerCase().includes(keyword) ||
      client.status.toLowerCase().includes(keyword);

    const matchesStatus =
      status === "All" || client.status === status;

    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <SearchBar
        search={search}
        setSearch={setSearch}
      />

      <StatusFilter
        status={status}
        setStatus={setStatus}
      />

      <ClientTable clients={filteredClients} />
    </>
  );
}