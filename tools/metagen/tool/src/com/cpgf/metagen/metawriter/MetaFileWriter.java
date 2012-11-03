package com.cpgf.metagen.metawriter;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.cpgf.metagen.Config;
import com.cpgf.metagen.Util;
import com.cpgf.metagen.codewriter.CppWriter;
import com.cpgf.metagen.doxyxmlparser.FileInfo;
import com.cpgf.metagen.metadata.CppClass;
import com.cpgf.metagen.metadata.MetaInfo;

public class MetaFileWriter {
	private FileInfo fileInfo;
	private Config config;
	private MetaInfo metaInfo;
	private List<CppClass> classList;
	private String sourceFileName;
	private Map<CppClass, MetaClassCode> classCodeMap;

	public MetaFileWriter(Config config, MetaInfo metaInfo, String sourceFileName, FileInfo fileInfo) {
		this.config = config;
		this.metaInfo = metaInfo;
		this.sourceFileName = sourceFileName;
		this.fileInfo = fileInfo;

		this.classList = new ArrayList<CppClass>();
		
		this.classCodeMap = new HashMap<CppClass, MetaClassCode>();
	}
	
	public void addClass(CppClass cppClass) {
		this.classList.add(cppClass);
	}

	private MetaClassCode getClassCode(CppClass cppClass) {
		MetaClassCode classCode = this.classCodeMap.get(cppClass);
		
		if(classCode == null) {
			classCode = (new MetaClassCodeGenerator(this.config, this.metaInfo, cppClass, this.sourceFileName)).generateClassMetaCode();
			this.classCodeMap.put(cppClass, classCode);
		}
		
		return classCode;
	}
	
	private boolean shouldWrapClass() {
		for(CppClass cppClass : this.classList) {
			if(this.metaInfo.getCallbackClassMap().getData(cppClass).wrapClass()) {
				return true;
			}
		}
		return false;
	}
	
	public void writeHeader() throws Exception {
		CppWriter codeWriter = new CppWriter();

		WriterUtil.writeCommentForAutoGeneration(codeWriter);	

		codeWriter.beginIncludeGuard(Util.normalizeSymbol(this.getDestFileName()) + "_H");

		if(this.config.headerHeaderCode != null) {
			codeWriter.write(this.config.headerHeaderCode);
			codeWriter.writeLine("");
		}
		codeWriter.include("cpgf/gmetadefine.h");
		codeWriter.include("cpgf/metadata/gmetadataconfig.h");
		codeWriter.include("cpgf/metadata/private/gmetadata_header.h");
		codeWriter.include("cpgf/gmetapolicy.h");
		if(this.config.scriptable) {
			codeWriter.include("cpgf/scriptbind/gscriptbindapi.h");
		}
		if(this.shouldWrapClass()) {
			codeWriter.include("cpgf/scriptbind/gscriptbindutil.h");
			codeWriter.include("cpgf/scriptbind/gscriptwrapper.h");
		}
		codeWriter.writeLine("");
		codeWriter.writeLine("");
				
		for(String ns : this.fileInfo.getNamespaceList()) {
			codeWriter.useNamespace(ns);
		}
		
		codeWriter.writeLine("");
		codeWriter.writeLine("");

		codeWriter.beginNamespace(this.config.cppNamespace);

		List<CppClass>  sortedClassList = Util.sortClassList(this.classList);
		for(CppClass cppClass : sortedClassList) {
			MetaClassCode classCode = this.getClassCode(cppClass);
			if(classCode.headerCode.length() > 0) {
				codeWriter.write(this.getClassCode(cppClass).headerCode);
			
				codeWriter.writeLine("");
				codeWriter.writeLine("");
			}
		}

		codeWriter.endNamespace(this.config.cppNamespace);
		
		codeWriter.writeLine("");
		codeWriter.writeLine("");
		codeWriter.include("cpgf/metadata/private/gmetadata_footer.h");
		
		codeWriter.endIncludeGuard();
		
		Util.forceCreateDirectories(this.config.headerOutput);
		String outFileName = this.makeOutputFileName(this.config.headerExtension);
		Util.writeTextToFile(outFileName, codeWriter.getText());
	}

	public void writeSource(List<String> createFunctionNames) throws Exception { 
		if(! this.config.autoRegisterToGlobal) {
			return;
		}
		
		CppWriter codeWriter = new CppWriter();

		WriterUtil.writeCommentForAutoGeneration(codeWriter);	

		if(this.config.sourceHeaderCode != null) {
			codeWriter.write(this.config.sourceHeaderCode);
			codeWriter.writeLine("");
		}
		if(this.config.sourceHeaderReplacer != null) {
			String fileName = this.sourceFileName;
			fileName = fileName.replaceAll("\\\\", "/");
			fileName = Util.replaceStringWithArray(fileName, this.config.sourceHeaderReplacer);
			codeWriter.include(fileName);
			codeWriter.writeLine("");
		}
		else {
			codeWriter.include(this.sourceFileName);
		}
		codeWriter.include(this.config.metaHeaderPath + this.getDestFileName() + ".h");
		codeWriter.writeLine("");
		
		codeWriter.useNamespace("cpgf");
		codeWriter.writeLine("");

		codeWriter.beginNamespace(this.config.cppNamespace);
		
		List<CppClass>  sortedClassList = Util.sortClassList(this.classList);
		for(CppClass cppClass : sortedClassList) {
			MetaClassCode classCode = this.getClassCode(cppClass);
			if(classCode.sourceCode.length() > 0) {
				codeWriter.write(classCode.sourceCode);
				
				createFunctionNames.add(classCode.createFunctionName);

				codeWriter.writeLine("");
				codeWriter.writeLine("");
			}
		}
		
		codeWriter.endNamespace(this.config.cppNamespace);
		
		Util.forceCreateDirectories(this.config.sourceOutput);
		String outFileName = Util.concatFileName(this.config.sourceOutput, this.getDestFileName()) + this.config.sourceExtension;
		Util.writeTextToFile(outFileName, codeWriter.getText());
	}

	private String makeOutputFileName(String extension) {
		return Util.concatFileName(this.config.headerOutput, this.getDestFileName()) + extension;
	}

	private String getBaseFileName()
	{
		return Util.getBaseFileName(this.sourceFileName);
	}

	private String getDestFileName()
	{
		return this.config.sourceFilePrefix + this.getBaseFileName();
	}

}
