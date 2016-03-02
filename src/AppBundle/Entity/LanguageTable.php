<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * LanguageTable
 *
 * @ORM\Table(name="Aux_Data.Language_Table", uniqueConstraints={@ORM\UniqueConstraint(name="Language_ID_UNIQUE", columns={"Language_ID"}), @ORM\UniqueConstraint(name="Language_Name_UNIQUE", columns={"Language_Name"}), @ORM\UniqueConstraint(name="Name_Code_UNIQUE", columns={"Name_Code"})})
 * @ORM\Entity
 */
class LanguageTable
{
    /**
     * @var string
     *
     * @ORM\Column(name="Language_Name", type="string", length=45, nullable=true)
     */
    private $languageName;

    /**
     * @var string
     *
     * @ORM\Column(name="Name_Code", type="string", length=10, nullable=true)
     */
    private $nameCode;

    /**
     * @var boolean
     *
     * @ORM\Column(name="Left_To_Right", type="boolean", nullable=true)
     */
    private $leftToRight;

    /**
     * @var string
     *
     * @ORM\Column(name="Encoding", type="string", length=10, nullable=true)
     */
    private $encoding;

    /**
     * @var integer
     *
     * @ORM\Column(name="Font_Scale", type="integer", nullable=true)
     */
    private $fontScale;

    /**
     * @var integer
     *
     * @ORM\Column(name="Language_ID", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="IDENTITY")
     */
    private $languageId;

    /**
     * Constructor
     */
    public function __construct()
    {
        $this->element = new \Doctrine\Common\Collections\ArrayCollection();
    }


    /**
     * Set languageName
     *
     * @param string $languageName
     *
     * @return LanguageTable
     */
    public function setLanguageName($languageName)
    {
        $this->languageName = $languageName;

        return $this;
    }

    /**
     * Get languageName
     *
     * @return string
     */
    public function getLanguageName()
    {
        return $this->languageName;
    }

    /**
     * Set nameCode
     *
     * @param string $nameCode
     *
     * @return LanguageTable
     */
    public function setNameCode($nameCode)
    {
        $this->nameCode = $nameCode;

        return $this;
    }

    /**
     * Get nameCode
     *
     * @return string
     */
    public function getNameCode()
    {
        return $this->nameCode;
    }

    /**
     * Set leftToRight
     *
     * @param boolean $leftToRight
     *
     * @return LanguageTable
     */
    public function setLeftToRight($leftToRight)
    {
        $this->leftToRight = $leftToRight;

        return $this;
    }

    /**
     * Get leftToRight
     *
     * @return boolean
     */
    public function getLeftToRight()
    {
        return $this->leftToRight;
    }

    /**
     * Set encoding
     *
     * @param string $encoding
     *
     * @return LanguageTable
     */
    public function setEncoding($encoding)
    {
        $this->encoding = $encoding;

        return $this;
    }

    /**
     * Get encoding
     *
     * @return string
     */
    public function getEncoding()
    {
        return $this->encoding;
    }

    /**
     * Set fontScale
     *
     * @param integer $fontScale
     *
     * @return LanguageTable
     */
    public function setFontScale($fontScale)
    {
        $this->fontScale = $fontScale;

        return $this;
    }

    /**
     * Get fontScale
     *
     * @return integer
     */
    public function getFontScale()
    {
        return $this->fontScale;
    }

    /**
     * Get languageId
     *
     * @return integer
     */
    public function getLanguageId()
    {
        return $this->languageId;
    }

}
