import { Component, ElementRef, OnInit, TemplateRef, viewChild, ViewChild } from '@angular/core';
import { Libro } from '../../model/libro.model';
import { Autor } from '../../model/autor.model';
import { Categoria } from '../../model/categoria.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { LibroService } from '../../services/libro';
import { AutorService } from '../../services/autor';
import { CategoriaService } from '../../services/categoria';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { NgFor } from '@angular/common';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-libro',
  standalone: false,
  templateUrl: './libro.html',
  styleUrl: './libro.css'
})
export class LibroComponent implements OnInit {

  libros: Libro[] = [];
  autores: Autor[] = [];
  categorias: Categoria[] = [];
  libro: Libro = {} as Libro;
  editar: boolean = false;
  idEditar: number | null = null;
  dataSource!: MatTableDataSource<Libro>;
  selectedFile!: File;
  imagenPreview: string = "";
  libroSelecionado: Libro | null = null;

  mostrarColumnas: string[] = ['detalles', 'idLibro', 'titulo', 'editorial', 'edicion', 'idioma', 'fechaPublicacion'
    , 'numEjemplares', 'precio', 'autor', 'categoria', 'acciones'];

  @ViewChild('formularioLibro') formularioLibro!: ElementRef;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('modalLibro') modalLibro!: TemplateRef<any>;
  @ViewChild('modalDetalles') modalDetalles!: TemplateRef<any>;

  constructor(
    private libroService: LibroService,
    private autorService: AutorService,
    private categoriaService: CategoriaService,
    private dialog: MatDialog,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.findAll();
    this.cargarCategorias();
    this.cargarAutores();
  }

  findAll(): void {
    this.libroService.findAll().subscribe(data => {
      this.dataSource = new MatTableDataSource(data);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  cargarCategorias(): void {
    this.categoriaService.findAll().subscribe(data => {
      this.categorias = data;
    });
  }

  cargarAutores(): void {
    this.autorService.findAll().subscribe(data => {
      this.autores = data;
    });
  }

  save(): void {
  this.libroService.save(this.libro).subscribe({
    next: () => {
      this.libro = {} as Libro;
      this.imagenPreview = "";
      this.findAll();
      Swal.fire('Éxito', 'Libro guardado correctamente', 'success');
    },
    error: (error) => {
      console.error('Error al guardar libro:', error);
      Swal.fire('Error', 'No se pudo guardar el libro', 'error');
    }
  });
}

update(): void {
  if (this.idEditar !== null) {
    const idCategoria = this.libro.categoria?.idCategoria;
    const idAutor = this.libro.autor?.idAutor;

    if (!idCategoria || !idAutor) {
      Swal.fire('Error', 'Debe seleccionar autor y categoría', 'error');
      return;
    }

    this.libroService.update(this.idEditar, idCategoria, idAutor, this.libro).subscribe({
      next: () => {
        this.libro = {} as Libro;
        this.imagenPreview = "";
        this.editar = false;
        this.idEditar = null;
        this.findAll();
        Swal.fire('Éxito', 'Libro actualizado correctamente', 'success');
      },
      error: (error) => {
        console.error('Error al actualizar libro:', error);
        Swal.fire('Error', 'No se pudo actualizar el libro', 'error');
      }
    });
  }
}

  delete(): void {
    Swal.fire({
      title: '¿Desea eliminar el libro?',
      text: 'Esta accion no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Si, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        this.libroService.delete(this.libro.idLibro).subscribe(() => {
          this.findAll();
          this.libro = {} as Libro;
          Swal.fire('Eliminado', 'El libro ha sido eliminado', 'success');
        });
      } else {
        this.libro = {} as Libro;
      }
    });
  }

  editarLibro(libro: Libro): void {
    this.libro = { ...libro };
    this.idEditar = libro.idLibro;
    this.editar = true;
    setTimeout(() => {
      this.formularioLibro.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  editarLibroCancelar(form: NgForm): void {
    this.libro = {} as Libro;
    this.idEditar = null;
    this.editar = false;
    form.resetForm();
  }

  guardarLibro(): void {
  // Verificar que se haya subido una imagen si es nuevo libro
  if (!this.editar && !this.libro.portada) {
    Swal.fire('Error', 'Debes subir una imagen para el libro', 'error');
    return;
  }

  if (this.editar && this.idEditar !== null) {
    this.update();
  } else {
    this.save();
  }

  this.dialog.closeAll();
}
  filtroLibro(event: Event): void{
    const filtro = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filtro.trim().toLowerCase();
  }

  nombreCompletoAutor(autor:Autor): string{
    return `${autor.nombre} ${autor.apellido}`;
  }

  abrirModal(libro?: Libro ):void{
    if(libro){
      this.libro={...libro};
      this.editar = true;
      this.idEditar = libro.idLibro;
    }else{
      this.libro = {} as Libro;
      this.editar = false;
      this.idEditar = null;
    }

    this.dialog.open(this.modalLibro, {
      width: '800px',
      disableClose: true
    });
  }

  compararAutores(a1: Autor, a2:Autor): boolean{
    return a1 && a2 ? a1.idAutor  === a2.idAutor: a1 === a2;
  }

  compararCategorias(c1: Categoria, c2: Categoria){
    return c1 && c2 ? c1.idCategoria === c2.idCategoria : c1 === c2;
  }

  onFileSelected(event: any) {
  this.selectedFile = event.target.files[0];
  
  if (this.selectedFile) {
    // Crear preview inmediatamente
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagenPreview = e.target.result;
    };
    reader.readAsDataURL(this.selectedFile);
  }
}

  subirImagen(): void {
  if (!this.selectedFile) {
    Swal.fire('Error', 'Selecciona una imagen primero', 'error');
    return;
  }

  const formData = new FormData();
  formData.append('file', this.selectedFile, this.selectedFile.name);

  if (this.libro.portada) {
    formData.append('oldImage', this.libro.portada);
  }

  this.http.post<{ruta: string}>('http://localhost:8080/api/upload-portada', formData).subscribe({
    next: (res) => {
      this.libro.portada = res.ruta;
      // Crear preview de la imagen
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagenPreview = e.target.result;
      };
      reader.readAsDataURL(this.selectedFile);
      
      Swal.fire('Éxito', 'Imagen subida correctamente', 'success');
    },
    error: (error) => {
      console.error('Error al subir imagen:', error);
      Swal.fire('Error', 'No se pudo subir la imagen: ' + error.error?.error, 'error');
    }
  });
}

  abrirModalDetalles(libro: Libro): void{
    this.libroSelecionado = libro;
    this.dialog.open(this.modalDetalles, {
      width:'500px'
    });
  }

  cerrarModal(): void{
    this.dialog.closeAll();
    this.libroSelecionado = null;
  }



}
