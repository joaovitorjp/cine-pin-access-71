import React, { useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addMovie } from "@/services/movieService";
import { toast } from "@/components/ui/use-toast";

interface BulkUploadMoviesFormProps {
  onSuccess: () => void;
}

const BulkUploadMoviesForm: React.FC<BulkUploadMoviesFormProps> = ({ onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number; failed: number } | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!file) {
      setError("Selecione um arquivo Excel (.xlsx ou .xls)");
      return;
    }

    setLoading(true);
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, defval: "" });

      // Filter empty rows
      const dataRows = rows.filter(
        (r) => Array.isArray(r) && r.some((c) => String(c ?? "").trim() !== "")
      );

      if (dataRows.length === 0) {
        setError("O arquivo está vazio.");
        setLoading(false);
        return;
      }

      let done = 0;
      let failed = 0;
      setProgress({ done: 0, total: dataRows.length, failed: 0 });

      for (const row of dataRows) {
        const [title, imageUrl, videoUrl, description, year, genre, rating] = row;
        const movie = {
          title: String(title ?? "").trim(),
          imageUrl: String(imageUrl ?? "").trim(),
          videoUrl: String(videoUrl ?? "").trim(),
          description: String(description ?? "").trim(),
          year: String(year ?? "").trim(),
          genre: String(genre ?? "").trim(),
          rating: String(rating ?? "").trim(),
        };

        if (!movie.title || !movie.imageUrl || !movie.videoUrl) {
          failed++;
          done++;
          setProgress({ done, total: dataRows.length, failed });
          continue;
        }

        try {
          await addMovie(movie);
        } catch (err) {
          console.error("Erro ao adicionar filme:", movie.title, err);
          failed++;
        }
        done++;
        setProgress({ done, total: dataRows.length, failed });
      }

      toast({
        title: "Importação concluída",
        description: `${done - failed} filme(s) adicionado(s)${failed > 0 ? `, ${failed} falharam` : ""}.`,
      });

      onSuccess();
    } catch (err) {
      console.error("Erro ao processar arquivo:", err);
      setError("Não foi possível processar o arquivo. Verifique o formato.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-sm text-netflix-gray space-y-1">
        <p>Envie um arquivo Excel <strong>sem cabeçalho</strong> com as colunas:</p>
        <ul className="list-disc list-inside text-xs space-y-0.5">
          <li><strong>A</strong> - Título</li>
          <li><strong>B</strong> - URL da imagem</li>
          <li><strong>C</strong> - URL do filme</li>
          <li><strong>D</strong> - Descrição</li>
          <li><strong>E</strong> - Ano</li>
          <li><strong>F</strong> - Gênero</li>
          <li><strong>G</strong> - Avaliação</li>
        </ul>
      </div>

      <div className="space-y-2">
        <Label htmlFor="excel-file">Arquivo Excel</Label>
        <Input
          id="excel-file"
          type="file"
          accept=".xlsx,.xls"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="bg-gray-700 border-gray-600 file:text-white"
          disabled={loading}
        />
      </div>

      {progress && (
        <div className="text-sm text-white">
          Processando {progress.done}/{progress.total}
          {progress.failed > 0 && <span className="text-red-400"> ({progress.failed} falharam)</span>}
        </div>
      )}

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex justify-end">
        <Button
          type="submit"
          className="bg-netflix-red hover:bg-red-700"
          disabled={loading || !file}
        >
          {loading ? "Enviando..." : "Importar Filmes"}
        </Button>
      </div>
    </form>
  );
};

export default BulkUploadMoviesForm;
